const { sql } = require('../_lib/db');
const { json, method } = require('../_lib/http');

const categoryNames = {
  HOME_JERSEYS: 'Home Jerseys',
  AWAY_JERSEYS: 'Away Jerseys',
  THIRD_JERSEYS: 'Third Jerseys',
  TRAINING_WEAR: 'Training Wear',
  LIFESTYLE_CLOTHING: 'Lifestyle Clothing',
  KIDS_COLLECTION: 'Kids Collection',
  CAPS_ACCESSORIES: 'Caps and Accessories',
  OTHER_MERCHANDISE: 'Other Club Merchandise'
};

const parseImages = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try { return JSON.parse(value) || []; } catch { return []; }
};

const product = (row) => {
  const images = parseImages(row.images).map((image) => ({
    url: image.url || '',
    alt: image.alt || row.name,
    sortOrder: Number(image.sortOrder || 0)
  })).filter((image) => image.url);
  const price = Number(row.price_tzs || 0);
  const promotionalPrice = row.promotional_price_tzs === null || typeof row.promotional_price_tzs === 'undefined' ? null : Number(row.promotional_price_tzs);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    category: row.category,
    categoryName: categoryNames[row.category] || row.category,
    priceTzs: price,
    promotionalPriceTzs: promotionalPrice,
    currency: 'TZS',
    displayPriceTzs: promotionalPrice === null ? price : promotionalPrice,
    isFeatured: row.is_featured === true,
    stockQty: Number(row.stock_qty || 0),
    availability: Number(row.stock_qty || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    customizationEnabled: row.customization_enabled === true,
    sizeGuideUrl: row.size_guide_url || '',
    images
  };
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') return method(res, 'GET');
  try {
    const query = new URL(req.url || '/', 'http://localhost');
    const id = String(query.searchParams.get('id') || '').trim();
    const slug = String(query.searchParams.get('slug') || '').trim().slice(0, 160);
    const categories = Object.keys(categoryNames);
    if (id || slug) {
      const result = id
        ? await sql`SELECT p.*, COALESCE((SELECT json_agg(json_build_object('url', i.image_url, 'alt', i.alt_text, 'sortOrder', i.sort_order) ORDER BY i.sort_order ASC, i.created_at ASC) FROM store_product_images i WHERE i.product_id = p.id), '[]'::json) AS images FROM store_products p WHERE p.id = ${id} AND p.is_published = TRUE LIMIT 1`
        : await sql`SELECT p.*, COALESCE((SELECT json_agg(json_build_object('url', i.image_url, 'alt', i.alt_text, 'sortOrder', i.sort_order) ORDER BY i.sort_order ASC, i.created_at ASC) FROM store_product_images i WHERE i.product_id = p.id), '[]'::json) AS images FROM store_products p WHERE p.slug = ${slug} AND p.is_published = TRUE LIMIT 1`;
      if (!result.rows[0]) return json(res, 404, { ok: false, message: 'Product not found.' });
      return json(res, 200, { ok: true, product: product(result.rows[0]), currency: 'TZS' });
    }
    const allowedCategories = new Set(categories);
    const category = allowedCategories.has(query.searchParams.get('category')) ? query.searchParams.get('category') : null;
    const search = String(query.searchParams.get('search') || '').trim().slice(0, 100) || null;
    const requestedPageSize = Number.parseInt(query.searchParams.get('pageSize') || '12', 10);
    const pageSize = Number.isInteger(requestedPageSize) ? Math.min(Math.max(requestedPageSize, 1), 24) : 12;
    const requestedPage = Number.parseInt(query.searchParams.get('page') || '1', 10);
    const page = Number.isInteger(requestedPage) ? Math.max(requestedPage, 1) : 1;
    const offset = (page - 1) * pageSize;
    const sort = String(query.searchParams.get('sort') || 'featured');
    const result = await sql`SELECT p.*, COALESCE((SELECT json_agg(json_build_object('url', i.image_url, 'alt', i.alt_text, 'sortOrder', i.sort_order) ORDER BY i.sort_order ASC, i.created_at ASC) FROM store_product_images i WHERE i.product_id = p.id), '[]'::json) AS images FROM store_products p WHERE p.is_published = TRUE AND (COALESCE(${category}, '') = '' OR p.category = ${category}) AND (COALESCE(${search}, '') = '' OR p.name ILIKE '%' || ${search} || '%' OR p.description ILIKE '%' || ${search} || '%') ORDER BY CASE WHEN ${sort} = 'price_low' THEN p.price_tzs END ASC NULLS LAST, CASE WHEN ${sort} = 'price_high' THEN p.price_tzs END DESC NULLS LAST, CASE WHEN ${sort} = 'newest' THEN p.created_at END DESC NULLS LAST, p.is_featured DESC, p.created_at DESC, p.name ASC LIMIT ${pageSize} OFFSET ${offset}`;
    const [total, availableCategories] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM store_products p WHERE p.is_published = TRUE AND (COALESCE(${category}, '') = '' OR p.category = ${category}) AND (COALESCE(${search}, '') = '' OR p.name ILIKE '%' || ${search} || '%' OR p.description ILIKE '%' || ${search} || '%')`,
      sql`SELECT DISTINCT category FROM store_products WHERE is_published = TRUE ORDER BY category ASC`
    ]);
    const totalCount = Number(total.rows[0]?.count || 0);
    return json(res, 200, {
      ok: true,
      currency: 'TZS',
      page,
      pageSize,
      total: totalCount,
      hasMore: offset + result.rows.length < totalCount,
      filters: { category, search, sort },
      categories: availableCategories.rows.map((row) => ({ value: row.category, label: categoryNames[row.category] || row.category })),
      products: result.rows.map(product)
    });
  } catch (error) {
    console.error('store products public feed failed', error);
    return json(res, 503, { ok: false, message: 'The store catalogue is not available yet.', products: [], categories: [] });
  }
};
