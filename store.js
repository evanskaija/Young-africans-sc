(() => {
  const grid = document.querySelector('[data-product-grid]');
  if (!grid) return;
  const state = { page: 1, pageSize: 12, hasMore: false, category: '', search: '', sort: 'featured', loading: false, error: false };
  const cartKey = 'ysc_store_cart_v1';
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const money = (value) => `${Number(value || 0).toLocaleString('en-TZ')} TZS`;
  const getCart = () => { try { const value = JSON.parse(localStorage.getItem(cartKey) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const updateCartCount = () => document.querySelectorAll('[data-cart-count]').forEach((node) => { node.textContent = getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0); });
  const imageMarkup = (product) => {
    const image = product.images && product.images[0];
    return image ? `<img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || product.name)}" loading="lazy" onerror="this.closest('.store-product-image').classList.add('is-empty');this.remove()" />` : '<span class="store-image-placeholder" aria-hidden="true">Y</span>';
  };
  const card = (product) => {
    const unavailable = product.availability !== 'IN_STOCK';
    const price = product.promotionalPriceTzs !== null ? `<span class="store-old-price">${money(product.priceTzs)}</span> ${money(product.promotionalPriceTzs)}` : money(product.priceTzs);
    return `<article class="store-product-card${product.isFeatured ? ' is-featured' : ''}"><a class="store-product-image" href="store-product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${escapeHtml(product.name)}">${imageMarkup(product)}${product.isFeatured ? '<span class="store-product-badge">FEATURED</span>' : ''}</a><div class="store-product-card-body"><span class="store-product-category">${escapeHtml(product.categoryName)}</span><h3><a href="store-product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3><p class="store-product-price">${price}</p><p class="store-product-availability ${unavailable ? 'is-out' : ''}">${unavailable ? 'Currently unavailable' : `${product.stockQty} available`}</p><a class="store-card-action${unavailable ? ' is-disabled' : ''}" href="store-product.html?id=${encodeURIComponent(product.id)}">VIEW PRODUCT <span aria-hidden="true">&#8599;</span></a></div></article>`;
  };
  const status = (message) => { const node = document.querySelector('[data-store-status]'); if (node) node.textContent = message; };
  const empty = (show, message) => { const node = document.querySelector('[data-store-empty]'); if (!node) return; node.hidden = !show; if (message) { const heading = node.querySelector('h3'); const copy = node.querySelector('p'); if (heading) heading.textContent = message.heading; if (copy) copy.textContent = message.copy; } };
  const renderCategories = (categories) => {
    const node = document.querySelector('[data-category-tabs]'); if (!node) return;
    node.innerHTML = `<button type="button" role="tab" aria-selected="${state.category === ''}" class="${state.category === '' ? 'is-active' : ''}" data-category="">All products</button>` + categories.map((category) => `<button type="button" role="tab" aria-selected="${state.category === category.value}" class="${state.category === category.value ? 'is-active' : ''}" data-category="${escapeHtml(category.value)}">${escapeHtml(category.label)}</button>`).join('');
    node.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => { state.category = button.dataset.category || ''; state.page = 1; load(true); }));
  };
  const load = async (reset) => {
    if (state.loading) return;
    state.loading = true;
    if (reset) { grid.innerHTML = ''; empty(false); }
    status('Checking published products…');
    const params = new URLSearchParams({ page: String(state.page), pageSize: String(state.pageSize), sort: state.sort });
    if (state.category) params.set('category', state.category);
    if (state.search) params.set('search', state.search);
    try {
      const response = await fetch(`/api/store/products?${params.toString()}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('catalogue unavailable');
      const data = await response.json();
      state.error = false; state.hasMore = Boolean(data.hasMore);
      renderCategories(data.categories || []);
      if (reset && (!data.products || data.products.length === 0)) {
        empty(true, { heading: 'No products published yet.', copy: 'Authorized store products will appear here once the club publishes verified product information.' });
      } else if (data.products && data.products.length) {
        grid.insertAdjacentHTML('beforeend', data.products.map(card).join(''));
        empty(false);
      }
      status(data.total ? `${data.total} published product${data.total === 1 ? '' : 's'}` : 'Catalogue awaiting published products');
      const loadMore = document.querySelector('[data-load-more]'); if (loadMore) loadMore.hidden = !state.hasMore;
    } catch (error) {
      state.error = true; state.hasMore = false;
      empty(true, { heading: 'Catalogue temporarily unavailable.', copy: 'The store catalogue service is unavailable. Please try again later.' });
      status('Catalogue unavailable');
      const loadMore = document.querySelector('[data-load-more]'); if (loadMore) loadMore.hidden = true;
    } finally { state.loading = false; updateCartCount(); }
  };
  const form = document.querySelector('[data-store-filters]');
  let searchTimer;
  form?.addEventListener('submit', (event) => event.preventDefault());
  form?.querySelector('[name="search"]')?.addEventListener('input', (event) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.search = event.target.value.trim().slice(0, 100); state.page = 1; load(true); }, 250); });
  form?.querySelector('[name="sort"]')?.addEventListener('change', (event) => { state.sort = event.target.value; state.page = 1; load(true); });
  document.querySelector('[data-load-more]')?.addEventListener('click', () => { state.page += 1; load(false); });
  updateCartCount();
  load(true);
})();
