(() => {
  const panels = Array.from(document.querySelectorAll('[data-dashboard-panel]'));
  const tabs = Array.from(document.querySelectorAll('[data-dashboard-tab]'));
  const status = document.querySelector('[data-dashboard-status]');
  const sectionLabel = document.querySelector('[data-current-section]');
  const menu = document.querySelector('[data-dashboard-menu]');
  const sidebar = document.querySelector('.member-sidebar');
  const setText = (selector, text) => { document.querySelectorAll(selector).forEach((node) => { node.textContent = text || '-'; }); };
  const setStatus = (message, tone = '') => { if (status) { status.textContent = message; status.dataset.tone = tone; } };
  const tabName = (key) => ({ overview: 'OVERVIEW', profile: 'MY PROFILE', application: 'APPLICATION', card: 'MY CARD', notifications: 'NOTIFICATIONS', settings: 'SETTINGS', support: 'SUPPORT' }[key] || 'OVERVIEW');

  const activate = (key, updateHash = true) => {
    const next = document.querySelector(`[data-dashboard-panel="${key}"]`) ? key : 'overview';
    panels.forEach((panel) => panel.classList.toggle('is-visible', panel.dataset.dashboardPanel === next));
    tabs.forEach((tab) => { const active = tab.dataset.dashboardTab === next; tab.classList.toggle('is-active', active); if (active) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current'); });
    if (sectionLabel) sectionLabel.textContent = tabName(next);
    if (updateHash && window.history?.replaceState) window.history.replaceState(null, '', `#${next}`);
    sidebar?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false');
  };
  tabs.forEach((tab) => tab.addEventListener('click', (event) => { event.preventDefault(); activate(tab.dataset.dashboardTab); }));
  document.querySelectorAll('[data-dashboard-tab-target]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); activate(link.dataset.dashboardTabTarget); }));
  menu?.addEventListener('click', () => { const open = sidebar.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(open)); });
  const initial = window.location.hash.replace('#', ''); activate(initial || 'overview', false);

  if (!window.MembershipClient) return;
  const render = (data) => {
    const user = data.user; const application = data.application; const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '); const location = application ? `${application.region} / ${application.district}` : 'Not submitted';
    setText('[data-member-name]', fullName); setText('[data-member-first-name]', user.firstName); setText('[data-member-initial]', fullName.charAt(0).toUpperCase()); setText('[data-member-email]', user.email); setText('[data-member-phone]', user.phone); setText('[data-profile-name]', fullName); setText('[data-profile-location]', location); setText('[data-member-mode]', data.mode === 'demo' ? 'DEMO BROWSER SESSION' : 'SECURE MEMBER SESSION'); setText('[data-card-name]', fullName);
    if (!application) { setStatus('No application is linked to this account yet. Start an application from the membership page.', 'info'); return; }
    const category = application.categoryName || window.MembershipClient.categoryNames[application.category]; const bank = application.bankName || window.MembershipClient.bankNames[application.bank];
    setText('[data-application-reference]', application.reference); setText('[data-application-status]', application.status); setText('[data-application-bank]', bank); setText('[data-application-category]', category); setText('[data-application-dob]', application.dateOfBirth); setText('[data-application-submitted]', `Submitted ${new Date(application.submittedAt).toLocaleDateString()}`);
    const normalized = String(application.status).toLowerCase(); const active = normalized.includes('reviewed') ? 3 : normalized.includes('under') || normalized.includes('more information') ? 2 : 1;
    document.querySelectorAll('[data-progress-step]').forEach((item) => { const step = Number(item.dataset.progressStep); item.classList.toggle('is-complete', step <= active); item.classList.toggle('is-current', step === active); const icon = item.querySelector('i'); if (icon) icon.textContent = step <= active ? '✓' : String(step); });
    const line = document.querySelector('[data-progress-line]'); if (line) line.style.width = `${active === 1 ? 0 : active === 2 ? 50 : 100}%`;
    setText('[data-dashboard-notice]', data.mode === 'demo' ? 'Illustrative dashboard: this record is stored only in this browser. Configure the secure API and database before accepting real supporter data.' : 'Your member information is loaded through the authenticated membership service.');
  };
  window.MembershipClient.me().then(render).catch((error) => { setStatus(error.message || 'Please sign in to view your dashboard.', 'error'); window.setTimeout(() => { window.location.href = '../login/index.html'; }, 800); });
  document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', async () => { await window.MembershipClient.logout(); window.location.href = '../login/index.html'; }));
})();
