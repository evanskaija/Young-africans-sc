(() => {
  const panel = document.querySelector('[data-admin-panel]');
  const lock = document.querySelector('[data-admin-lock]');
  const message = document.querySelector('[data-admin-message]');
  const rows = document.querySelector('[data-admin-rows]');
  const search = document.querySelector('[data-admin-search]');
  const status = document.querySelector('[data-admin-status]');
  const queue = document.querySelector('[data-setup-queue]');
  const queueStatus = document.querySelector('[data-queue-status]');
  const supportQueue = document.querySelector('[data-support-queue]');
  const supportQueueStatus = document.querySelector('[data-support-queue-status]');
  if (!panel || !window.MembershipClient) return;

  const fixturesLink = document.createElement('a');
  fixturesLink.className = 'membership-v2-button membership-v2-button-dark admin-fixtures-link';
  fixturesLink.href = '../fixtures/';
  fixturesLink.textContent = 'OPEN FIXTURE CMS';
  document.querySelector('.membership-admin-toolbar')?.appendChild(fixturesLink);

  let applications = [];
  const escapeHtml = (text) => String(text || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
  const setStatus = (node, text, tone = '') => { if (node) { node.textContent = text; node.dataset.tone = tone; } };
  const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '—';
  const renderCounts = (counts) => {
    document.querySelector('[data-count-total]').textContent = counts.total || 0;
    document.querySelector('[data-count-pending]').textContent = counts.pending || 0;
    document.querySelector('[data-count-under-review]').textContent = counts.underReview || 0;
    document.querySelector('[data-count-reviewed]').textContent = counts.reviewed || 0;
  };
  const renderRows = () => {
    const term = search.value.trim().toLowerCase();
    const filtered = applications.filter((item) => `${item.reference} ${item.fullName}`.toLowerCase().includes(term));
    rows.innerHTML = filtered.length ? filtered.map((item) => `<tr><td><strong>${escapeHtml(item.reference)}</strong></td><td>${escapeHtml(item.fullName)}<small>${escapeHtml(item.email)}</small></td><td>${escapeHtml(item.categoryName || 'Membership path')}</td><td>${escapeHtml(item.identificationNumberMasked || '—')}<small>${escapeHtml(item.identificationType || '')}</small></td><td>${escapeHtml(item.registrationRouteName || 'Authorized guidance')}</td><td>${formatDate(item.submittedAt)}</td><td><select data-admin-status-id="${escapeHtml(item.id)}" aria-label="Update status for ${escapeHtml(item.reference)}"><option ${item.status === 'Pending Review' ? 'selected' : ''}>Pending Review</option><option ${item.status === 'Under Review' ? 'selected' : ''}>Under Review</option><option ${item.status === 'More Information Required' ? 'selected' : ''}>More Information Required</option><option ${item.status === 'Reviewed' ? 'selected' : ''}>Reviewed</option><option ${item.status === 'APPROVED' ? 'selected' : ''}>APPROVED</option><option ${item.status === 'REJECTED' ? 'selected' : ''}>REJECTED</option></select></td></tr>`).join('') : '<tr><td colspan="7">No registration requests match this search.</td></tr>';
    rows.querySelectorAll('[data-admin-status-id]').forEach((control) => control.addEventListener('change', async () => {
      control.disabled = true;
      try { await window.MembershipClient.adminUpdate(control.dataset.adminStatusId, control.value); setStatus(status, 'Registration request status updated.', 'success'); await load(); }
      catch (error) { setStatus(status, error.message || 'Status update failed.', 'error'); control.disabled = false; }
    }));
  };
  const load = async () => {
    const data = await window.MembershipClient.adminList(search.value.trim());
    applications = data.applications || [];
    renderCounts(data.counts || { total: applications.length, pending: 0, underReview: 0, reviewed: 0 });
    renderRows();
  };
  const renderSetupQueue = (items) => {
    if (!queue) return;
    queue.innerHTML = items.length ? items.map((item) => `<div class="membership-setup-queue-row"><strong>${escapeHtml(item.request_reference)}</strong><span>${escapeHtml(item.official_membership_number)}</span><small>${escapeHtml(item.status)} · ${formatDate(item.created_at)}</small><select data-setup-status-id="${escapeHtml(item.id)}" aria-label="Update setup request ${escapeHtml(item.request_reference)}"><option ${item.status === 'AWAITING_STAFF_VERIFICATION' ? 'selected' : ''}>AWAITING_STAFF_VERIFICATION</option><option ${item.status === 'NEEDS_INFORMATION' ? 'selected' : ''}>NEEDS_INFORMATION</option><option ${item.status === 'VERIFIED' ? 'selected' : ''}>VERIFIED</option><option ${item.status === 'REJECTED' ? 'selected' : ''}>REJECTED</option></select></div>`).join('') : '<p>No ownership verification requests found.</p>';
    queue.querySelectorAll('[data-setup-status-id]').forEach((control) => control.addEventListener('change', async () => {
      control.disabled = true;
      try { await window.MembershipClient.adminUpdateSetupRequest(control.dataset.setupStatusId, control.value); setStatus(queueStatus, 'Setup request status updated.', 'success'); loadSetupQueue(); }
      catch (error) { setStatus(queueStatus, error.message || 'Setup request update failed.', 'error'); control.disabled = false; }
    }));
  };
  const loadSetupQueue = async () => {
    setStatus(queueStatus, 'Loading ownership verification requests...', 'info');
    try { const data = await window.MembershipClient.adminSetupRequests(); renderSetupQueue(data.requests || []); setStatus(queueStatus, `${(data.requests || []).length} request(s) loaded. Confirm official records before any account is linked.`, 'success'); }
    catch (error) { setStatus(queueStatus, error.message || 'Verification queue unavailable.', 'error'); }
  };
  const renderSupportQueue = (items) => {
    if (!supportQueue) return;
    supportQueue.innerHTML = items.length ? items.map((item) => `<div class="membership-setup-queue-row"><strong>${escapeHtml(item.request_reference)}</strong><span>${escapeHtml(item.first_name || '')} ${escapeHtml(item.last_name || '')} · ${escapeHtml(item.category)}</span><small>${escapeHtml(item.status)} · ${formatDate(item.created_at)}</small><select data-support-status-id="${escapeHtml(item.id)}" aria-label="Update support request ${escapeHtml(item.request_reference)}"><option ${item.status === 'OPEN' ? 'selected' : ''}>OPEN</option><option ${item.status === 'IN_PROGRESS' ? 'selected' : ''}>IN_PROGRESS</option><option ${item.status === 'NEEDS_INFORMATION' ? 'selected' : ''}>NEEDS_INFORMATION</option><option ${item.status === 'RESOLVED' ? 'selected' : ''}>RESOLVED</option><option ${item.status === 'CLOSED' ? 'selected' : ''}>CLOSED</option></select></div>`).join('') : '<p>No member support requests found.</p>';
    supportQueue.querySelectorAll('[data-support-status-id]').forEach((control) => control.addEventListener('change', async () => {
      control.disabled = true;
      try { await window.MembershipClient.adminUpdateServiceRequest(control.dataset.supportStatusId, control.value); setStatus(supportQueueStatus, 'Support request status updated.', 'success'); loadSupportQueue(); }
      catch (error) { setStatus(supportQueueStatus, error.message || 'Support request update failed.', 'error'); control.disabled = false; }
    }));
  };
  const loadSupportQueue = async () => {
    setStatus(supportQueueStatus, 'Loading member support requests...', 'info');
    try { const data = await window.MembershipClient.adminServiceRequests(); renderSupportQueue(data.requests || []); setStatus(supportQueueStatus, `${(data.requests || []).length} request(s) loaded.`, 'success'); }
    catch (error) { setStatus(supportQueueStatus, error.message || 'Member support queue unavailable.', 'error'); }
  };

  search.addEventListener('input', renderRows);
  document.querySelector('[data-load-setup-queue]')?.addEventListener('click', loadSetupQueue);
  document.querySelector('[data-load-support-queue]')?.addEventListener('click', loadSupportQueue);
  Promise.all([load(), loadSetupQueue(), loadSupportQueue()]).then(() => { lock.hidden = true; panel.hidden = false; }).catch((error) => { message.textContent = error.status === 401 || error.status === 403 ? 'This page is protected. Sign in with an authorized administrator account to manage verification and member support.' : (error.message || 'The admin service is not configured yet.'); });
})();
