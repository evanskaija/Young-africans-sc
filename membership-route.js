(() => {
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 35);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
  menu?.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    document.body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
    header?.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    menu?.setAttribute('aria-expanded', 'false');
  }));
  document.querySelectorAll('a[href="../dashboard/"]').forEach((link) => { link.href = '../dashboard/index.html'; });
  document.querySelectorAll('a[href="../application-status/"]').forEach((link) => { link.href = '../application-status/index.html'; });
  document.querySelectorAll('a[href="../login/"]').forEach((link) => { link.href = '../login/index.html'; });
  document.querySelectorAll('a[href="../join/"]').forEach((link) => { link.href = '../join/index.html'; });
  document.querySelectorAll('.membership-route-faq details').forEach((item, index, items) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      items.forEach((other) => { if (other !== item) other.open = false; });
    });
  });
})();
