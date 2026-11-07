(() => {
  const key = 'ysc_store_cart_v1';
  const itemsNode = document.querySelector('[data-cart-items]'); const summaryNode = document.querySelector('[data-cart-summary]'); const status = document.querySelector('[data-cart-status]');
  if (!itemsNode || !summaryNode) return;
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const money = (value) => `${Number(value || 0).toLocaleString('en-TZ')} TZS`;
  const read = () => { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const write = (cart) => { localStorage.setItem(key, JSON.stringify(cart)); render(); };
  const updateHeader = (cart) => document.querySelectorAll('[data-cart-count]').forEach((node) => { node.textContent = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0); });
  const render = () => {
    const cart = read(); updateHeader(cart);
    if (!cart.length) { itemsNode.innerHTML = '<div class="store-empty store-empty-inline"><div class="store-empty-mark">Y</div><h2>Your cart is empty.</h2><p>Browse published Yanga merchandise and add an item to begin a catalogue enquiry.</p><a class="store-primary-button" href="store.html">BROWSE THE STORE</a></div>'; summaryNode.innerHTML = ''; status.textContent = ''; return; }
    itemsNode.innerHTML = cart.map((item, index) => `<article class="store-cart-item"><div class="store-cart-item-image">${item.imageUrl ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" />` : '<span class="store-image-placeholder" aria-hidden="true">Y</span>'}</div><div class="store-cart-item-copy"><span class="store-product-category">${item.size || item.color ? `${escapeHtml(item.size || '')}${item.size && item.color ? ' / ' : ''}${escapeHtml(item.color || '')}` : 'Selected product'}</span><h2>${escapeHtml(item.name)}</h2><p>${money(item.priceTzs)}</p><label>Quantity<input data-quantity-index="${index}" type="number" min="1" max="20" value="${Math.max(1, Number(item.quantity || 1))}" /></label><button class="store-remove-button" data-remove-index="${index}" type="button">REMOVE</button></div></article>`).join('');
    const subtotal = cart.reduce((sum, item) => sum + Number(item.priceTzs || 0) * Number(item.quantity || 0), 0);
    summaryNode.innerHTML = `<span class="store-eyebrow">ENQUIRY SUMMARY</span><h2>YOUR <em>TOTAL.</em></h2><div class="store-summary-row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><p>Prices and stock will be revalidated by the store team before any enquiry is confirmed.</p><a class="store-primary-button" href="store-checkout.html">CONTINUE TO ENQUIRY</a>`;
    itemsNode.querySelectorAll('[data-remove-index]').forEach((button) => button.addEventListener('click', () => { const next = read(); next.splice(Number(button.dataset.removeIndex), 1); write(next); }));
    itemsNode.querySelectorAll('[data-quantity-index]').forEach((input) => input.addEventListener('change', () => { const next = read(); next[Number(input.dataset.quantityIndex)].quantity = Math.min(20, Math.max(1, Number(input.value) || 1)); write(next); }));
  };
  render();
})();
