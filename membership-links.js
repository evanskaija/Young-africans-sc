(() => {
  const normalizeDirectoryLink = (directory, file) => {
    document.querySelectorAll(`a[href^="${directory}"]`).forEach((link) => {
      const raw = link.getAttribute('href') || '';
      if (raw === directory) link.href = `${directory}${file}`;
      else if (raw.startsWith(`${directory}?`)) link.href = `${directory}${file}${raw.slice(directory.length)}`;
    });
  };

  document.querySelectorAll('a[href="membership.html#join-now"]').forEach((link) => { link.href = 'membership/join/index.html'; });
  document.querySelectorAll('a[href="membership.html#member-login"]').forEach((link) => { link.href = 'membership/login/index.html'; });
  normalizeDirectoryLink('membership/join/', 'index.html');
  normalizeDirectoryLink('membership/login/', 'index.html');
  normalizeDirectoryLink('membership/dashboard/', 'index.html');
  normalizeDirectoryLink('membership/setup/', 'index.html');

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const rawHref = link.getAttribute('href') || '';
    if (link.hasAttribute('data-join-yanga') || (link.closest('.header-actions') && link.textContent.trim().startsWith('JOIN YANGA'))) {
      event.preventDefault();
      window.location.href = 'membership/join/index.html';
      return;
    }
    if (rawHref === 'membership.html#join-now' || rawHref === 'membership/join/' || rawHref.startsWith('membership/join/?category=')) {
      event.preventDefault();
      const query = rawHref.includes('?') ? rawHref.slice(rawHref.indexOf('?')) : '';
      window.location.href = `membership/join/index.html${query}`;
    }
  });
})();
