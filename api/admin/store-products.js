const crypto = require('crypto');
const { sql } = require('../_lib/db');
const { json, readBody, method } = require('../_lib/http');
const { requireAdmin } = require('../_lib/auth');

const categories = new Set(['HOME_JERSEYS', 'AWAY_JERSEYS', 'THIRD_JERSEYS', 'TRAINING_WEAR', 'LIFESTYLE_CLOTHING', 'KIDS_COLLECTION', 'CAPS_ACCESSORIES', 'OTHER_MERCHANDISE']);
const text = (value, max) => String(value || '').trim().slice(0, max);
const localOrRemoteUrl = (value) => {
  const candidate = text(value, 700);
  if (!candidate) return null;
  if (/^(?:https?:\/\/|\/?Assets\/|\.?\/?Assets\/)/i.test(candidate)) return candidate;
  return null;
};
const arrayText = (value, maxItems = 30, maxLength = 80) => (Array.isArray(value) ? value : String(value || '').split(',')).map((item) => text(item, maxLength)).filter(Boolean).slice(0, maxItems);
const slugify = (value) => text(value, 150).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 130);
const parseMoney = (value) => value === '' || value === null || typeof value === 'undefined' ? NaN : Number(value);
const mapProduct = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description || '',
  category: row.category,
  priceTzs: Number(row.price_tzs),
  promotionalPriceTzs: row.promotional_price_tzs === null ? null : Number(row.promotional_price_tzs),
  isPublished: row.is_published === true,
  isFeatured: row.is_featured === true,
  stockQty: Number(row.stock_qty || 0),
  sizes: row.sizes || [],
  colors: row.colors || [],
  customizationEnabled: row.customization_enabled === true,
  sizeGuideUrl: row.size_guide_url || '',
  images: row.images || []
});

const clean = (body) => {
  const priceTzs = parseMoney(body.priceTzs);
  const promotionalPriceTzs = body.promotionalPriceTzs === '' || body.promotionalPriceTzs === null || typeof body.promotionalPriceTzs === 'undefined' ? null : parseMoney(body.promotionalPriceTzs);
  const stockQty = Number(body.stockQty);
  const data = {
    name: text(body.name, 160),
    slug: slugify(body.slug || body.name),
    description: text(body.description, 4000),
    category: text(body.category, 40).toUpperCase(),
    priceTzs,
    promotionalPriceTzs,
    stockQty,
    sizes: arrayText(body.sizes),
    colors: arrayText(body.colors),
    isPublished: body.isPublished === true,
    isFeatured: body.isFeatured === true,
    customizationEnabled: body.customizationEnabled === true,
    sizeGuideUrl: localOrRemoteUrl(body.sizeGuideUrl),
    images: (Array.isArray(body.images) ? body.images : []).map((image, index) => ({ url: localOrRemoteUrl(image.url), alt: text(image.alt || body.name, 180), sortOrder: Number.isInteger(Number(image.sortOrder)) ? Number(image.sortOrder) : index })).filter((image) => image.url)
  };
  const errors = [];
  if (!data.name) errors.push('Product name is required.');
  if (!data.slug) errors.push('Product slug is required.');
  if (!categories.has(data.category)) errors.push('Choose a valid product category.');
  if (!Number.isFinite(data.priceTzs) || data.priceTzs < 0) errors.push('Price must be a valid non-negative TZS amount.');
  if (data.promotionalPriceTzs !== null && (!Number.isFinite(data.promotionalPriceTzs) || data.promotionalPriceTzs < 0 || data.promotionalPriceTzs > data.priceTzs)) errors.push('Promotional price must be between zero and the regular price.');
  if (!Number.isInteger(data.stockQty) || data.stockQty < 0) errors.push('Stock quantity must be a whole number of zero or more.');
  if (body.sizeGuideUrl && !data.sizeGuideUrl) errors.push('Size guide must be an approved local asset path or an http(s) URL.');
  if (data.isPublished && data.images.length === 0) errors.push('A published product needs at least one approved product image.');
  return { data, errors };
};

module.exports = async (req, res) => {
  if (!['GET', 'POST', 'PATCH'].includes(req.method)) return method(res, 'GET, POST, PATCH');
  try {
    const user = await requireAdmin(req, res); if (!user) return;
    if (req.method === 'GET') {
      const result = await sql`SELECT p.*, COALESCE((SELECT json_agg(json_build_object('url', i.image_url, 'alt', i.alt_text, 'sortOrder', i.sort_order) ORDER BY i.sort_order ASC, i.created_at ASC) FROM store_product_images i WHERE i.product_id = p.id), '[]'::json) AS images FROM store_products p ORDER BY p.updated_at DESC LIMIT 500`;
      return json(res, 200, { ok: true, products: result.rows.map(mapProduct), categories: [...categories] });
    }
    const body = await readBody(req);
    if (req.method === 'PATCH' && !body.id) return json(res, 422, { message: 'Product id is required.' });
    const { data, errors } = clean(body);
    if (errors.length) return json(res, 422, { message: errors.join(' ') });
    const id = body.id || crypto.randomUUID();
    const result = await sql`
      INSERT INTO store_products (id, slug, name, description, category, price_tzs, promotional_price_tzs, is_published, is_featured, stock_qty, sizes, colors, customization_enabled, size_guide_url)
      VALUES (${id}, ${data.slug}, ${data.name}, ${data.description}, ${data.category}, ${data.priceTzs}, ${data.promotionalPriceTzs}, ${data.isPublished}, ${data.isFeatured}, ${data.stockQty}, ${data.sizes}, ${data.colors}, ${data.customizationEnabled}, ${data.sizeGuideUrl})
      ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name, description = EXCLUDED.description, category = EXCLUDED.category, price_tzs = EXCLUDED.price_tzs, promotional_price_tzs = EXCLUDED.promotional_price_tzs, is_published = EXCLUDED.is_published, is_featured = EXCLUDED.is_featured, stock_qty = EXCLUDED.stock_qty, sizes = EXCLUDED.sizes, colors = EXCLUDED.colors, customization_enabled = EXCLUDED.customization_enabled, size_guide_url = EXCLUDED.size_guide_url, updated_at = NOW()
      RETURNING *
    `;
    await sql`DELETE FROM store_product_images WHERE product_id = ${id}`;
    for (const image of data.images) await sql`INSERT INTO store_product_images (id, product_id, image_url, alt_text, sort_order) VALUES (${crypto.randomUUID()}, ${id}, ${image.url}, ${image.alt}, ${image.sortOrder})`;
    return json(res, 200, { ok: true, product: mapProduct({ ...result.rows[0], images: data.images }) });
  } catch (error) {
    console.error('store product admin failed', error);
    return json(res, 500, { message: 'The store catalogue administration service is unavailable.' });
  }
};
