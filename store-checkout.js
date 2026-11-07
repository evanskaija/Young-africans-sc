(() => {
  const key = 'ysc_store_cart_v1'; const form = document.querySelector('[data-checkout-form]'); const summary = document.querySelector('[data-checkout-summary]'); const status = document.querySelector('[data-checkout-status]'); const delivery = document.querySelector('[data-delivery-field]');
  if (!form || !summary || !status) return;
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const money = (value) => `${Number(value || 0).toLocaleString('en-TZ')} TZS`;
  const read = () => { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const cart = read();
  const subtotal = cart.reduce((sum, item) => sum + Number(item.priceTzs || 0) * Number(item.quantity || 0), 0);
  if (!cart.length) { status.innerHTML = '<p class="store-alert">Your cart is empty. <a href="store.html">Browse the store</a> before sending an enquiry.</p>'; form.hidden = true; return; }
  summary.innerHTML = `<span class="store-eyebrow">SELECTED PRODUCTS</span><h2>ENQUIRY <em>SUMMARY.</em></h2><ul class="store-checkout-items">${cart.map((item) => `<li><span>${escapeHtml(item.name)} × ${item.quantity}${item.size ? ` · ${escapeHtml(item.size)}` : ''}${item.color ? ` · ${escapeHtml(item.color)}` : ''}</span><strong>${money(Number(item.priceTzs) * Number(item.quantity))}</strong></li>`).join('')}</ul><div class="store-summary-row"><span>Estimated subtotal</span><strong>${money(subtotal)}</strong></div><p>Payment is not enabled. No payment details are collected on this page.</p>`;
  form.querySelectorAll('[name="fulfillmentOption"]').forEach((input) => input.addEventListener('change', () => { const isDelivery = form.querySelector('[name="fulfillmentOption"]:checked')?.value === 'DELIVERY'; delivery.hidden = !isDelivery; delivery.querySelector('textarea').required = isDelivery; }));
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); status.textContent = 'Sending enquiry…'; form.querySelector('button[type="submit"]').disabled = true;
    const data = new FormData(form); const payload = { customerName: data.get('customerName'), email: data.get('email'), phone: data.get('phone'), fulfillmentOption: data.get('fulfillmentOption'), deliveryAddress: data.get('deliveryAddress'), notes: data.get('notes'), items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity, size: item.size, color: item.color })) };
    try { const response = await fetch('/api/store/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Unable to send enquiry.'); localStorage.removeItem(key); form.hidden = true; status.innerHTML = `<div class="store-success"><span class="store-eyebrow">ENQUIRY RECEIVED</span><h2>THANK <em>YOU.</em></h2><p>${escapeHtml(result.message)}</p><strong>Reference: ${escapeHtml(result.orderReference)}</strong><a class="store-primary-button" href="store.html">RETURN TO STORE</a></div>`; } catch (error) { status.textContent = error.message; form.querySelector('button[type="submit"]').disabled = false; }
  });
})();
