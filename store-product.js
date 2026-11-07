(() => {
  const status = document.querySelector('[data-product-status]');
  const detail = document.querySelector('[data-product-detail]');
  const cartKey = 'ysc_store_cart_v1';
  if (!status || !detail) return;
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const money = (value) => `${Number(value || 0).toLocaleString('en-TZ')} TZS`;
  const getCart = () => { try { const value = JSON.parse(localStorage.getItem(cartKey) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const saveCart = (cart) => { localStorage.setItem(cartKey, JSON.stringify(cart)); document.querySelectorAll('[data-cart-count]').forEach((node) => { node.textContent = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0); }); };
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || '';
  const render = (product) => {
    const images = product.images || [];
    const mainImage = images[0];
    const price = product.promotionalPriceTzs !== null ? `<span class="store-old-price">${money(product.priceTzs)}</span> ${money(product.promotionalPriceTzs)}` : money(product.priceTzs);
    const options = product.sizes.length ? `<label>Size<select name="size" required><option value="">Choose size</option>${product.sizes.map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join('')}</select></label>` : '';
    const colors = product.colors.length ? `<label>Colour<select name="color" required><option value="">Choose colour</option>${product.colors.map((color) => `<option value="${escapeHtml(color)}">${escapeHtml(color)}</option>`).join('')}</select></label>` : '';
    detail.innerHTML = `<div class="store-product-gallery"><div class="store-product-main-image">${mainImage ? `<img src="${escapeHtml(mainImage.url)}" alt="${escapeHtml(mainImage.alt || product.name)}" onerror="this.closest('.store-product-main-image').classList.add('is-empty');this.remove()" />` : '<span class="store-image-placeholder" aria-hidden="true">Y</span>'}</div><div class="store-product-thumbs">${images.map((image) => `<img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || product.name)}" loading="lazy" />`).join('')}</div></div><div class="store-product-copy"><span class="store-product-category">${escapeHtml(product.categoryName)}</span><h1>${escapeHtml(product.name)}</h1><p class="store-detail-price">${price}</p><p class="store-detail-description">${escapeHtml(product.description || 'Official product information will be shown here once confirmed by the club store team.')}</p><p class="store-product-availability ${product.availability === 'IN_STOCK' ? '' : 'is-out'}">${product.availability === 'IN_STOCK' ? `${product.stockQty} available` : 'Currently unavailable'}</p><form class="store-add-form" data-add-form>${options}${colors}<label>Quantity<input name="quantity" type="number" min="1" max="${Math.max(1, Math.min(product.stockQty || 1, 20))}" value="1" ${product.availability !== 'IN_STOCK' ? 'disabled' : ''} /></label><button class="store-primary-button" type="submit" ${product.availability !== 'IN_STOCK' ? 'disabled' : ''}>ADD TO CART</button><p class="store-form-note">Payment is not enabled. Cart items can be sent as a catalogue enquiry.</p></form><dl class="store-specifications"><div><dt>Category</dt><dd>${escapeHtml(product.categoryName)}</dd></div><div><dt>Currency</dt><dd>TZS</dd></div><div><dt>Customization</dt><dd>${product.customizationEnabled ? 'Available when confirmed by the club' : 'Not available'}</dd></div>${product.sizeGuideUrl ? `<div><dt>Size guide</dt><dd><a href="${escapeHtml(product.sizeGuideUrl)}">View size guide</a></dd></div>` : ''}</dl></div>`;
    detail.hidden = false; status.textContent = '';
    fetch(`/api/store/products?category=${encodeURIComponent(product.category)}&pageSize=4&sort=featured`, { headers: { Accept: 'application/json' } }).then((response) => response.ok ? response.json() : null).then((data) => {
      const related = (data?.products || []).filter((item) => item.id !== product.id).slice(0, 4);
      if (!related.length) return;
      detail.insertAdjacentHTML('beforeend', `<section class="store-related" aria-labelledby="related-products-title"><span class="store-eyebrow">MORE FROM THIS COLLECTION</span><h2 id="related-products-title">YOU MAY ALSO <em>LIKE.</em></h2><div class="store-product-grid">${related.map((item) => `<article class="store-product-card"><a class="store-product-image" href="store-product.html?id=${encodeURIComponent(item.id)}">${item.images?.[0] ? `<img src="${escapeHtml(item.images[0].url)}" alt="${escapeHtml(item.images[0].alt || item.name)}" loading="lazy" />` : '<span class="store-image-placeholder" aria-hidden="true">Y</span>'}</a><div class="store-product-card-body"><span class="store-product-category">${escapeHtml(item.categoryName)}</span><h3><a href="store-product.html?id=${encodeURIComponent(item.id)}">${escapeHtml(item.name)}</a></h3><p class="store-product-price">${money(item.displayPriceTzs)}</p></div></article>`).join('')}</div></section>`);
    }).catch(() => {});
    detail.querySelector('[data-add-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget; const formData = new FormData(form); const count = Math.max(1, Number(formData.get('quantity') || 1));
      const item = { productId: product.id, slug: product.slug, name: product.name, priceTzs: product.displayPriceTzs, quantity: count, size: String(formData.get('size') || ''), color: String(formData.get('color') || ''), imageUrl: mainImage?.url || '' };
      const cart = getCart(); const same = (existing) => existing.productId === item.productId && existing.size === item.size && existing.color === item.color; const existing = cart.find(same);
      if (existing) existing.quantity = Math.min(20, existing.quantity + count); else cart.push(item);
      saveCart(cart); window.location.href = 'store-cart.html';
    });
  };
  if (!id) { status.textContent = 'This product link is incomplete.'; return; }
  fetch(`/api/store/products?id=${encodeURIComponent(id)}`, { headers: { Accept: 'application/json' } }).then((response) => { if (!response.ok) throw new Error('not found'); return response.json(); }).then((data) => render(data.product)).catch(() => { status.textContent = 'This product is not available or has not been published.'; });
})();
