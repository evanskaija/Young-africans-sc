(() => {
  let utilityBar = document.querySelector('.prototype-bar');
  let oldHeader = document.querySelector('.site-header');
  if (!utilityBar && document.body) {
    utilityBar = document.createElement('div');
    utilityBar.className = 'prototype-bar';
    document.body.insertBefore(utilityBar, document.body.firstChild);
  }
  if (!oldHeader && document.body) {
    oldHeader = document.createElement('header');
    oldHeader.className = 'site-header';
    document.body.insertBefore(oldHeader, utilityBar?.nextSibling || document.body.firstChild);
  }
  if (!utilityBar || !oldHeader) return;

  const path = window.location.pathname.toLowerCase();
  const nested = /\/(?:membership|admin)\/[^/]+\/index\.html$/.test(path);
  const root = nested ? '../../' : '';
  const page = path.endsWith('/news.html') ? 'news' : (path.endsWith('/membership.html') || path.includes('/membership/') || path.includes('/admin/')) ? 'membership' : path.endsWith('/ratiba.html') ? 'ratiba' : (path.endsWith('/store.html') || path.endsWith('/store-product.html') || path.endsWith('/store-cart.html') || path.endsWith('/store-checkout.html')) ? 'store' : 'home';
  const current = (name) => page === name ? ' aria-current="page"' : '';

  utilityBar.outerHTML = '<div class="prototype-bar reference-utility-bar"><div class="utility-bar-inner"><span class="reference-utility-status">YANGA / OFFICIAL WEBSITE</span><nav class="reference-socials" aria-label="Social links"><a href="' + root + 'index.html#contact" aria-label="Facebook">f</a><a href="' + root + 'index.html#contact" aria-label="X">𝕏</a><a href="' + root + 'index.html#contact" aria-label="Instagram">◎</a><a href="' + root + 'index.html#contact" aria-label="YouTube">▶</a><a href="' + root + 'index.html#contact" aria-label="TikTok">♪</a></nav><div class="reference-utility-actions"><div class="reference-language" aria-label="Language switcher"><button class="active">SW</button><span>|</span><button>EN</button></div><button class="reference-search" type="button" aria-label="Open search"></button><a class="reference-ticket-cta" href="' + root + 'index.html#fixtures"><span aria-hidden="true">▣</span> Kupia Tiketi</a><a class="reference-store-cta" href="' + root + 'index.html#shop"><span aria-hidden="true">▰</span> Duka la Yanga</a></div></div></div>';

  oldHeader.outerHTML = '<header class="site-header reference-site-header" id="top"><a class="brand reference-brand" href="' + root + 'index.html#top" aria-label="Young Africans SC home"><span class="brand-mark"><img src="' + root + 'young-africansc.png" alt="Young Africans SC crest" /></span><span class="brand-copy"><strong>YOUNG AFRICANS SC</strong><small>OFFICIAL WEBSITE</small></span></a><nav class="main-nav reference-main-nav" aria-label="Main navigation"><a href="' + root + 'index.html">Nyumbani</a><a href="' + root + 'index.html#club">Klabu <span class="nav-chevron">⌄</span></a><a href="' + root + 'index.html#club">Timu <span class="nav-chevron">⌄</span></a><a href="' + root + 'index.html#fixtures">Ratiba</a><a href="' + root + 'index.html#fixtures">Matokeo</a><a href="' + root + 'news.html"' + current('news') + '>Habari</a><a href="' + root + 'index.html#club">Mashabiki <span class="nav-chevron">⌄</span></a><a href="' + root + 'index.html#shop">Duka</a><a href="' + root + 'index.html#contact">Mawasiliano</a></nav><div class="header-actions reference-header-actions"><a href="' + root + 'membership/login/index.html">MY YANGA</a></div><button class="menu-toggle" aria-label="Open menu" aria-expanded="false"><i></i><i></i><i></i></button></header>';

  const headerActions = document.querySelector('.reference-header-actions');
  if (headerActions) {
    headerActions.innerHTML = '<a class="reference-login-cta" href="' + root + 'membership/login/index.html">MEMBER LOGIN</a><a class="reference-join-cta" href="' + root + 'membership/join/index.html">JOIN YANGA</a>';
  }
  const ratibaLink = document.querySelector('.reference-main-nav a:nth-child(4)');
  const matokeoLink = document.querySelector('.reference-main-nav a:nth-child(5)');
  const storeLink = document.querySelector('.reference-main-nav a:nth-child(8)');
  const storeCta = document.querySelector('.reference-store-cta');
  if (ratibaLink) { ratibaLink.href = root + 'ratiba.html'; if (page === 'ratiba') ratibaLink.setAttribute('aria-current', 'page'); }
  if (matokeoLink) matokeoLink.href = root + 'ratiba.html#ratiba-results';
  if (storeLink) { storeLink.href = root + 'store.html'; if (page === 'store') storeLink.setAttribute('aria-current', 'page'); }
  if (storeCta) storeCta.href = root + 'store.html';

  const brandCopy = document.querySelector('.reference-brand .brand-copy');
  brandCopy?.style.setProperty('display', 'flex', 'important');
  brandCopy?.style.setProperty('flex-direction', 'column', 'important');
  const mobileMenu = document.querySelector('.reference-site-header > .menu-toggle');
  if (window.innerWidth <= 560) {
    brandCopy?.style.setProperty('align-self', 'center', 'important');
    brandCopy?.style.setProperty('margin-bottom', '0', 'important');
    brandCopy?.style.setProperty('transform', 'none', 'important');
    brandCopy?.style.setProperty('width', '150px', 'important');
    brandCopy?.style.setProperty('flex', '0 0 150px', 'important');
    const brandTitle = brandCopy?.querySelector('strong');
    brandTitle?.style.setProperty('display', 'block', 'important');
    brandTitle?.style.setProperty('font-size', '12px', 'important');
    brandTitle?.style.setProperty('line-height', '1', 'important');
    brandTitle?.style.setProperty('color', '#fff', 'important');
    mobileMenu?.style.setProperty('display', 'flex', 'important');
    mobileMenu?.style.setProperty('visibility', 'visible', 'important');
    mobileMenu?.style.setProperty('opacity', '1', 'important');
    mobileMenu?.style.setProperty('position', 'absolute', 'important');
    mobileMenu?.style.setProperty('top', '17px', 'important');
    mobileMenu?.style.setProperty('right', '12px', 'important');
    mobileMenu?.style.setProperty('left', 'auto', 'important');
    mobileMenu?.querySelectorAll('i').forEach((line) => {
      line.style.setProperty('display', 'block', 'important');
      line.style.setProperty('width', '18px', 'important');
      line.style.setProperty('height', '2px', 'important');
      line.style.setProperty('margin', '3px 0', 'important');
      line.style.setProperty('background', '#fff', 'important');
    });
  }
  if (page === 'home') document.querySelector('.reference-main-nav a:first-child')?.setAttribute('aria-current', 'page');
  if (page === 'membership') document.querySelector('.reference-main-nav a[href$="membership.html"]')?.setAttribute('aria-current', 'page');
  if (page === 'ratiba') document.querySelector('.reference-main-nav a[href$="ratiba.html"]')?.setAttribute('aria-current', 'page');
  mobileMenu?.addEventListener('click', () => {
    const open = document.querySelector('.reference-site-header')?.classList.toggle('menu-open');
    mobileMenu.setAttribute('aria-expanded', String(Boolean(open)));
  });
  document.querySelectorAll('.reference-main-nav a').forEach((link) => link.addEventListener('click', () => {
    document.querySelector('.reference-site-header')?.classList.remove('menu-open');
    mobileMenu?.setAttribute('aria-expanded', 'false');
  }));
})();
