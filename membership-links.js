(() => {
  document.querySelectorAll('a[href="membership.html#join-now"]').forEach((link) => { link.href = 'membership/join/index.html'; });
  document.querySelectorAll('a[href="membership.html#member-login"]').forEach((link) => { link.href = 'membership/login/index.html'; });
  document.querySelectorAll('a[href^="membership/join/"]').forEach((link) => { link.href = link.href.replace('/membership/join/', '/membership/join/index.html'); });
  document.querySelectorAll('a[href^="membership/login/"]').forEach((link) => { link.href = link.href.replace('/membership/login/', '/membership/login/index.html'); });
  document.querySelectorAll('a[href^="membership/dashboard/"]').forEach((link) => { link.href = link.href.replace('/membership/dashboard/', '/membership/dashboard/index.html'); });
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const rawHref = link.getAttribute('href') || '';
    if (link.hasAttribute('data-join-yanga') || (link.closest('.header-actions') && link.textContent.trim().startsWith('JOIN YANGA'))) {
      event.preventDefault();
      window.location.href = 'membership/join/index.html';
      return;
    }
    if (rawHref === 'membership.html#join-now' || rawHref === 'membership/join/' || rawHref === 'membership/join/?category=category-01' || rawHref === 'membership/join/?category=category-02' || rawHref === 'membership/join/?category=category-03') {
      event.preventDefault();
      const query = rawHref.includes('?') ? rawHref.slice(rawHref.indexOf('?')) : '';
      window.location.href = `membership/join/index.html${query}`;
    }
  });
})();
