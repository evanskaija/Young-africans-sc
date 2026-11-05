(() => {
  if (!window.MembershipClient) return;
  const setText = (selector, text) => { const node = document.querySelector(selector); if (node) node.textContent = text || '—'; };
  const message = document.querySelector('[data-status-message]');
  window.MembershipClient.status().then((data) => {
    if (!data.application) { setText('[data-status-message]', 'No application is linked to this account yet.'); return; }
    const application = data.application; const user = data.user;
    setText('[data-status-reference]', application.reference); setText('[data-status-value]', application.status); setText('[data-status-name]', [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ')); setText('[data-status-category]', application.categoryName || window.MembershipClient.categoryNames[application.category]); setText('[data-status-bank]', application.bankName || window.MembershipClient.bankNames[application.bank]); setText('[data-status-date]', new Date(application.submittedAt).toLocaleDateString());
    if (data.mode === 'demo') { message.textContent = 'Demo mode: this status is stored only in this browser until the secure API and database are configured.'; message.dataset.tone = 'info'; }
  }).catch((error) => { message.textContent = error.message || 'Please sign in to view your application status.'; message.dataset.tone = 'error'; window.setTimeout(() => { window.location.href = '../login/index.html'; }, 900); });
})();
