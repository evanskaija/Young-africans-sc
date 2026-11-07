(() => {
  if (!window.MembershipClient) return;
  const setText = (selector, text) => document.querySelectorAll(selector).forEach((node) => { node.textContent = text || '—'; });
  const message = document.querySelector('[data-status-message]');
  window.MembershipClient.status().then((data) => {
    if (!data.application) {
      if (message) message.textContent = 'No registration request is linked to this account yet.';
      return;
    }
    const app = data.application;
    const user = data.user || {};
    setText('[data-status-reference]', app.reference);
    setText('[data-status-value]', app.status);
    setText('[data-status-name]', [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '));
    setText('[data-status-category]', app.categoryName || window.MembershipClient.categoryNames[app.category]);
    setText('[data-status-date]', app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—');
    if (message) {
      message.textContent = data.mode === 'demo'
        ? 'Demo mode: this registration request is stored only in this browser until the secure service and authorized membership source are configured.'
        : 'This request does not create an official membership number. Complete membership through the authorized registration source before MY YANGA setup.';
      message.dataset.tone = 'info';
    }
  }).catch((error) => {
    if (message) { message.textContent = error.message || 'Please sign in to view your registration request.'; message.dataset.tone = 'error'; }
    window.setTimeout(() => { window.location.href = '../login/index.html'; }, 900);
  });
})();
