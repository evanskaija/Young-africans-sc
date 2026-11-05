(() => {
  const form = document.querySelector('[data-login-route-form]');
  if (!form || !window.MembershipClient) return;
  const status = document.querySelector('[data-login-route-status]');
  const setStatus = (message, tone = '') => { status.textContent = message; status.dataset.tone = tone; };
  document.querySelector('[data-login-password-toggle]')?.addEventListener('change', (event) => { form.elements.password.type = event.target.checked ? 'text' : 'password'; });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'SIGNING IN...'; setStatus('Checking your account...', 'info');
    try { await window.MembershipClient.login({ email: form.elements.email.value.trim(), password: form.elements.password.value }); window.location.href = '../dashboard/index.html'; }
    catch (error) { setStatus(error.message || 'Email or password is incorrect.', 'error'); button.disabled = false; button.innerHTML = 'SIGN IN <span>&#8599;</span>'; }
  });
  document.querySelector('[data-recover-route]')?.addEventListener('click', () => setStatus('Password recovery will be connected to an approved identity provider before launch. Contact membership support for assistance.', 'info'));
})();
