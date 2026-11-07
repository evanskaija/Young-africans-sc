(() => {
  const panels = Array.from(document.querySelectorAll('[data-dashboard-panel]'));
  const tabs = Array.from(document.querySelectorAll('[data-dashboard-tab]'));
  const status = document.querySelector('[data-dashboard-status]');
  const sectionLabel = document.querySelector('[data-current-section]');
  const menu = document.querySelector('[data-dashboard-menu]');
  const sidebar = document.querySelector('.member-sidebar');
  const setText = (selector, text) => document.querySelectorAll(selector).forEach((node) => { node.textContent = text === null || text === undefined || text === '' ? '—' : text; });
  const setStatus = (message, tone = '') => { if (status) { status.textContent = message; status.dataset.tone = tone; } };
  const tabName = (key) => ({ overview: 'OVERVIEW', membership: 'MEMBERSHIP RECORD', profile: 'MY PROFILE', notifications: 'NOTIFICATIONS', settings: 'ACCOUNT SECURITY', support: 'MEMBER SUPPORT' }[key] || 'OVERVIEW');

  const activate = (key, updateHash = true) => {
    const next = document.querySelector(`[data-dashboard-panel="${key}"]`) ? key : 'overview';
    panels.forEach((panel) => panel.classList.toggle('is-visible', panel.dataset.dashboardPanel === next));
    tabs.forEach((tab) => {
      const active = tab.dataset.dashboardTab === next;
      tab.classList.toggle('is-active', active);
      if (active) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
    });
    if (sectionLabel) sectionLabel.textContent = tabName(next);
    if (updateHash && window.history?.replaceState) window.history.replaceState(null, '', `#${next}`);
    sidebar?.classList.remove('is-open');
    menu?.setAttribute('aria-expanded', 'false');
  };

  tabs.forEach((tab) => tab.addEventListener('click', (event) => { event.preventDefault(); activate(tab.dataset.dashboardTab); }));
  document.querySelectorAll('[data-dashboard-tab-target]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); activate(link.dataset.dashboardTabTarget); }));
  menu?.addEventListener('click', () => { const open = sidebar.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(open)); });
  activate(window.location.hash.replace('#', '') || 'overview', false);

  const supportPanel = document.querySelector('[data-dashboard-panel="support"]');
  if (supportPanel && !supportPanel.querySelector('[data-service-request-form]')) {
    const block = document.createElement('section');
    block.className = 'member-service-request-card';
    block.innerHTML = '<span class="member-panel-kicker">MEMBER SERVICES</span><h3>Request member support.</h3><form data-service-request-form><label>Service category<select name="category" required><option value="">Choose a service</option><option value="membership-verification">Membership number verification</option><option value="account-access">MY YANGA account access</option><option value="incorrect-details">Incorrect membership details</option><option value="lost-card">Membership card support</option><option value="general-support">General member support</option></select></label><label>Description<textarea name="description" rows="4" minlength="10" placeholder="Describe what you need help with." required></textarea></label><button class="member-dashboard-inline-button" type="submit">SUBMIT SUPPORT REQUEST <span>→</span></button><p class="membership-route-status" data-service-request-status role="status" aria-live="polite"></p></form><div data-service-request-list><span class="member-panel-kicker">RECENT CASES</span></div>';
    supportPanel.appendChild(block);
    const serviceForm = block.querySelector('[data-service-request-form]');
    const serviceStatus = block.querySelector('[data-service-request-status]');
    const setServiceStatus = (message, tone = '') => { serviceStatus.textContent = message; serviceStatus.dataset.tone = tone; };
    const renderRequests = (items) => {
      const list = block.querySelector('[data-service-request-list]');
      list.innerHTML = `<span class="member-panel-kicker">RECENT CASES</span>${items?.length ? items.map((item) => `<div class="member-service-request-row"><strong>${item.reference || item.request_reference || 'CASE'}</strong><span>${item.status}</span><small>${item.category}</small></div>`).join('') : '<p>No support requests yet.</p>'}`;
    };
    window.MembershipClient.serviceRequests().then((data) => renderRequests(data.requests || data.serviceRequests || [])).catch(() => renderRequests([]));
    serviceForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!serviceForm.reportValidity()) return;
      const button = serviceForm.querySelector('button');
      button.disabled = true;
      setServiceStatus('Submitting support request...', 'info');
      try {
        const response = await window.MembershipClient.submitServiceRequest({ category: serviceForm.elements.category.value, description: serviceForm.elements.description.value.trim() });
        setServiceStatus(`Request submitted: ${response.request?.reference || response.request?.request_reference || 'pending'}.`, 'success');
        serviceForm.reset();
      } catch (error) {
        setServiceStatus(error.message || 'Request could not be submitted.', 'error');
      } finally { button.disabled = false; }
    });
  }

  if (!window.MembershipClient) return;
  const render = (data) => {
    const user = data.user || {};
    const application = data.application || null;
    const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
    const location = application ? [application.region, application.district].filter(Boolean).join(' / ') : 'Not available';
    setText('[data-member-first-name]', user.firstName || 'Member');
    setText('[data-member-initial]', fullName.charAt(0).toUpperCase() || 'W');
    setText('[data-member-email]', user.email);
    setText('[data-member-phone]', user.phone);
    setText('[data-profile-name]', fullName);
    setText('[data-profile-location]', location);
    setText('[data-profile-dob]', application?.dateOfBirth);
    setText('[data-official-membership-number]', user.officialMembershipNumber || 'Official number not linked');
    setText('[data-card-name]', fullName);
    setText('[data-member-mode]', data.mode === 'demo' ? 'DEMO BROWSER SESSION' : 'SECURE MEMBER SESSION');
    if (!application) {
      setText('[data-membership-status]', 'NO RECORD LINKED');
      setStatus('No membership record is linked to this account yet.', 'info');
      return;
    }
    setText('[data-application-reference]', application.reference);
    setText('[data-application-status]', application.status);
    setText('[data-application-category]', application.categoryName || window.MembershipClient.categoryNames[application.category]);
    setText('[data-application-submitted]', application.submittedAt ? `Recorded ${new Date(application.submittedAt).toLocaleDateString()}` : '—');
    setText('[data-profile-identification]', `${application.identificationTypeName || 'Identification'} · ${application.identificationNumberMasked || 'Masked record'}`);
    setText('[data-membership-status]', application.membershipStatus === 'ACTIVE' ? 'ACTIVE' : 'PENDING OFFICIAL RECORD');
    setText('[data-dashboard-notice]', data.mode === 'demo' ? 'DEMO WORKFLOW: this browser record is illustrative. Official membership details and MY YANGA access require an authorized source.' : 'Your member information is loaded through the authenticated MY YANGA service.');
  };

  window.MembershipClient.me().then(render).catch((error) => {
    setStatus(error.message || 'Please sign in to view MY YANGA.', 'error');
    window.setTimeout(() => { window.location.href = '../login/index.html'; }, 800);
  });
  document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', async () => { await window.MembershipClient.logout(); window.location.href = '../login/index.html'; }));
})();
