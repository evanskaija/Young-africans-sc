(() => {
  const shell = document.querySelector('[data-setup-shell]');
  if (!shell || !window.MembershipClient) return;
  const steps = Array.from(shell.querySelectorAll('[data-setup-step]'));
  const indicators = Array.from(document.querySelectorAll('[data-setup-indicator]'));
  const number = shell.querySelector('[name="membershipNumber"]');
  const contact = shell.querySelector('[name="contact"]');
  const otpPanel = shell.querySelector('[data-otp-panel]');
  const otpContact = shell.querySelector('[data-otp-contact]');
  const otpCode = shell.querySelector('[name="otpCode"]');
  const passwordForm = shell.querySelector('[data-password-form]');
  const status = shell.querySelector('[data-setup-status]');
  const lookupStatus = shell.querySelector('[data-setup-lookup-status]');
  const requestStatus = shell.querySelector('[data-setup-request-status]');
  const otpStatus = shell.querySelector('[data-otp-status]');
  const passwordStatus = shell.querySelector('[data-password-status]');
  let membershipNumber = '';
  let challengeId = '';
  let setupToken = '';

  const setText = (node, message, tone = '') => { if (node) { node.textContent = message; node.dataset.tone = tone; } };
  const show = (step) => { steps.forEach((item) => { item.hidden = Number(item.dataset.setupStep) !== step; }); indicators.forEach((item) => { const current = Number(item.dataset.setupIndicator); item.classList.toggle('is-active', current === step); item.classList.toggle('is-complete', current < step); }); };
  const busy = (button, value) => { if (button) { button.disabled = value; button.dataset.busy = value ? 'true' : 'false'; } };

  shell.querySelector('[data-setup-continue]')?.addEventListener('click', async () => {
    membershipNumber = String(number.value || '').trim().toUpperCase();
    if (!/^[A-Z0-9-]{4,50}$/.test(membershipNumber)) { setText(status, 'Enter the official membership number shown on your authorized membership record.', 'error'); return; }
    setText(status, 'Checking the authorized membership record...', 'info');
    try {
      const response = await window.MembershipClient.setupRequest({ action: 'lookup', membershipNumber });
      show(2);
      if (response.verificationAvailable) {
        otpPanel.hidden = false;
        setText(otpContact, `A one-time code will be sent to ${response.maskedContact}. The code expires shortly and can be used once.`, 'info');
        setText(lookupStatus, 'Choose OTP verification or use the authorized staff fallback below.', 'info');
      } else {
        setText(lookupStatus, response.message || 'OTP verification is not available for this record. Use the staff-assisted route below.', 'info');
      }
    } catch (error) { show(2); setText(lookupStatus, error.message || 'The authorized membership verification service is unavailable.', 'error'); }
  });

  shell.querySelector('[data-send-otp]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget; busy(button, true); setText(otpStatus, 'Sending a verification code...', 'info');
    try {
      const response = await window.MembershipClient.setupRequest({ action: 'send-otp', membershipNumber });
      challengeId = response.challengeId || ''; setText(otpStatus, `${response.message} Enter it below.`, 'success'); otpCode?.focus();
    } catch (error) { setText(otpStatus, error.message || 'The verification email could not be sent.', 'error'); }
    finally { busy(button, false); }
  });

  shell.querySelector('[data-verify-otp]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget; const code = String(otpCode.value || '').trim();
    if (!challengeId) { setText(otpStatus, 'Request a verification code first.', 'error'); return; }
    if (!/^\d{6}$/.test(code)) { setText(otpStatus, 'Enter the six-digit verification code from the official contact inbox.', 'error'); return; }
    busy(button, true); setText(otpStatus, 'Checking the verification code...', 'info');
    try { const response = await window.MembershipClient.setupRequest({ action: 'verify-otp', membershipNumber, challengeId, code }); setupToken = response.setupToken || ''; show(3); setText(passwordStatus, response.message || 'Ownership verified. Create your password.', 'success'); }
    catch (error) { setText(otpStatus, error.message || 'The verification code could not be confirmed.', 'error'); }
    finally { busy(button, false); }
  });

  shell.querySelector('[data-setup-request]')?.addEventListener('click', async (event) => {
    if (!membershipNumber) { show(1); setText(status, 'Enter your official membership number first.', 'error'); return; }
    const button = event.currentTarget; busy(button, true); setText(requestStatus, 'Submitting a staff-assisted verification request...', 'info');
    try { const response = await window.MembershipClient.setupRequest({ action: 'staff-request', membershipNumber, contact: String(contact.value || '').trim() }); setText(requestStatus, `${response.message} Reference: ${response.reference}`, 'success'); }
    catch (error) { setText(requestStatus, error.message || 'We could not submit the verification request.', 'error'); }
    finally { busy(button, false); }
  });

  passwordForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = String(passwordForm.elements.password.value || ''); const confirmPassword = String(passwordForm.elements.confirmPassword.value || '');
    if (!setupToken) { setText(passwordStatus, 'Your verification session is missing. Start setup again.', 'error'); return; }
    if (password.length < 8) { setText(passwordStatus, 'Use a password of at least 8 characters.', 'error'); return; }
    if (password !== confirmPassword) { setText(passwordStatus, 'The passwords do not match.', 'error'); return; }
    const button = passwordForm.querySelector('button[type="submit"]'); busy(button, true); setText(passwordStatus, 'Creating your secure MY YANGA account...', 'info');
    try { const response = await window.MembershipClient.setupRequest({ action: 'create-password', membershipNumber, setupToken, password }); setText(passwordStatus, response.message || 'Your account is ready. Use Member Login to continue.', 'success'); button.hidden = true; const link = document.createElement('a'); link.className = 'membership-v2-button membership-v2-button-dark'; link.href = '../login/'; link.textContent = 'CONTINUE TO MEMBER LOGIN'; passwordForm.appendChild(link); }
    catch (error) { setText(passwordStatus, error.message || 'We could not create your password.', 'error'); busy(button, false); }
  });
  show(1);
})();
