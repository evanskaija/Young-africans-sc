const crypto = require('crypto');
const { sql } = require('../_lib/db');
const { json, readBody, method } = require('../_lib/http');

const text = (value, max) => String(value || '').trim().slice(0, max);
const email = (value) => { const candidate = text(value, 180).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : ''; };
const quantity = (value) => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 20 ? Number(value) : 0;
const reference = () => `YSC-ENQ-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return method(res, 'POST');
  try {
    const body = await readBody(req);
    const customerName = text(body.customerName, 160);
    const customerEmail = email(body.email);
    const phone = text(body.phone, 60);
    const fulfillmentOption = text(body.fulfillmentOption, 20).toUpperCase();
    const deliveryAddress = text(body.deliveryAddress, 500);
    const notes = text(body.notes, 1000);
    const errors = [];
    if (!customerName) errors.push('Your name is required.');
    if (!customerEmail) errors.push('A valid email is required.');
    if (!phone) errors.push('A phone number is required.');
    if (!['DELIVERY', 'PICKUP'].includes(fulfillmentOption)) errors.push('Choose delivery or pickup.');
    if (fulfillmentOption === 'DELIVERY' && !deliveryAddress) errors.push('A delivery address is required.');
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 30) errors.push('Add at least one valid product to the enquiry.');
    if (errors.length) return json(res, 422, { message: errors.join(' ') });
    const verifiedItems = [];
    for (const item of body.items) {
      const id = text(item.productId, 80);
      const count = quantity(item.quantity);
      if (!id || !count) return json(res, 422, { message: 'Each product needs a valid quantity.' });
      const result = await sql`SELECT id, name, price_tzs, promotional_price_tzs, stock_qty, sizes, colors, is_published FROM store_products WHERE id = ${id} LIMIT 1`;
      const row = result.rows[0];
      if (!row || row.is_published !== true) return json(res, 422, { message: 'One of the selected products is no longer published.' });
      if (Number(row.stock_qty || 0) < count) return json(res, 422, { message: `${row.name} does not have enough stock for this enquiry.` });
      const size = text(item.size, 80) || null;
      const color = text(item.color, 80) || null;
      if (size && Array.isArray(row.sizes) && row.sizes.length && !row.sizes.includes(size)) return json(res, 422, { message: `The selected size for ${row.name} is not available.` });
      if (color && Array.isArray(row.colors) && row.colors.length && !row.colors.includes(color)) return json(res, 422, { message: `The selected colour for ${row.name} is not available.` });
      const unitPrice = row.promotional_price_tzs === null ? Number(row.price_tzs) : Number(row.promotional_price_tzs);
      verifiedItems.push({ id, name: row.name, unitPrice, quantity: count, size, color });
    }
    const subtotal = verifiedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const orderId = crypto.randomUUID();
    const orderReference = reference();
    await sql`INSERT INTO store_orders (id, order_reference, customer_name, email, phone, fulfillment_option, delivery_address, subtotal_tzs, notes, payment_status) VALUES (${orderId}, ${orderReference}, ${customerName}, ${customerEmail}, ${phone}, ${fulfillmentOption}, ${deliveryAddress || null}, ${subtotal}, ${notes || null}, 'NOT_ENABLED')`;
    for (const item of verifiedItems) await sql`INSERT INTO store_order_items (id, order_id, product_id, product_name_snapshot, unit_price_tzs, quantity, size, color) VALUES (${crypto.randomUUID()}, ${orderId}, ${item.id}, ${item.name}, ${item.unitPrice}, ${item.quantity}, ${item.size}, ${item.color})`;
    return json(res, 201, { ok: true, orderReference, subtotalTzs: subtotal, paymentStatus: 'NOT_ENABLED', message: 'Enquiry received. The store team will contact you to confirm availability and fulfilment.' });
  } catch (error) {
    console.error('store enquiry failed', error);
    return json(res, 500, { message: 'The store enquiry service is unavailable.' });
  }
};
