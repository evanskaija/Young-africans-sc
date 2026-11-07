const { sql } = require('../_lib/db');
const { json, readBody, method } = require('../_lib/http');
const { requireAdmin } = require('../_lib/auth');

const statuses = new Set(['ENQUIRY', 'CONTACTED', 'CONFIRMED', 'FULFILLED', 'CANCELLED']);
const mapOrder = (row) => ({ id: row.id, orderReference: row.order_reference, customerName: row.customer_name, email: row.email, phone: row.phone, fulfillmentOption: row.fulfillment_option, deliveryAddress: row.delivery_address || '', status: row.status, subtotalTzs: Number(row.subtotal_tzs), paymentStatus: row.payment_status, notes: row.notes || '', createdAt: row.created_at, items: row.items || [] });

module.exports = async (req, res) => {
  if (!['GET', 'PATCH'].includes(req.method)) return method(res, 'GET, PATCH');
  try {
    const user = await requireAdmin(req, res); if (!user) return;
    if (req.method === 'GET') {
      const result = await sql`SELECT o.*, COALESCE((SELECT json_agg(json_build_object('productName', i.product_name_snapshot, 'quantity', i.quantity, 'unitPriceTzs', i.unit_price_tzs, 'size', i.size, 'color', i.color) ORDER BY i.id) FROM store_order_items i WHERE i.order_id = o.id), '[]'::json) AS items FROM store_orders o ORDER BY o.created_at DESC LIMIT 500`;
      return json(res, 200, { ok: true, orders: result.rows.map(mapOrder) });
    }
    const body = await readBody(req);
    const status = String(body.status || '').toUpperCase();
    if (!body.id || !statuses.has(status)) return json(res, 422, { message: 'Choose a valid order and fulfilment status.' });
    const result = await sql`UPDATE store_orders SET status = ${status}, updated_at = NOW() WHERE id = ${body.id} RETURNING *, '[]'::json AS items`;
    if (!result.rows[0]) return json(res, 404, { message: 'Order enquiry not found.' });
    return json(res, 200, { ok: true, order: mapOrder(result.rows[0]) });
  } catch (error) {
    console.error('store orders admin failed', error);
    return json(res, 500, { message: 'The store orders administration service is unavailable.' });
  }
};
