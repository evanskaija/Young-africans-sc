(() => {
  const form = document.querySelector('[data-join-form]');
  if (!form || !window.MembershipClient) return;
  const steps = Array.from(form.querySelectorAll('[data-route-step]'));
  const indicators = Array.from(document.querySelectorAll('[data-route-step-indicator]'));
  const back = form.querySelector('[data-route-back]');
  const next = form.querySelector('[data-route-next]');
  const submit = form.querySelector('[data-route-submit]');
  const status = form.querySelector('[data-join-status]');
  const review = form.querySelector('[data-join-review]');
  const success = document.querySelector('[data-join-success]');
  const successCopy = document.querySelector('[data-join-success-copy]');
  const categoryCards = Array.from(form.querySelectorAll('[data-category-card]'));
  const bankCards = Array.from(form.querySelectorAll('[data-bank-card]'));
  let step = 1;

  const value = (name) => String(form.elements[name]?.value || '').trim();
  const escapeHtml = (text) => String(text || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
  const setStatus = (message, tone = '') => { status.textContent = message; status.dataset.tone = tone; };
  const selectedCategory = () => window.MembershipClient.categoryNames[value('category')] || 'Not selected';
  const selectedBank = () => window.MembershipClient.bankNames[value('bank')] || 'Not selected';
  const updateSelection = () => { categoryCards.forEach((card) => card.classList.toggle('is-selected', card.querySelector('input')?.checked)); bankCards.forEach((card) => card.classList.toggle('is-selected', card.querySelector('input')?.checked)); };
  const setCustomValidity = () => {
    const password = form.elements.password; const confirmPassword = form.elements.confirmPassword;
    if (password && password.value && password.value.length < 8) password.setCustomValidity('Use at least eight characters.'); else if (password) password.setCustomValidity('');
    if (confirmPassword && confirmPassword.value !== password?.value) confirmPassword.setCustomValidity('Passwords must match.'); else if (confirmPassword) confirmPassword.setCustomValidity('');
  };
  const clearFieldError = (field) => { field.removeAttribute('aria-invalid'); field.parentElement?.querySelector('.field-error')?.remove(); };
  const showFieldError = (field) => { clearFieldError(field); field.setAttribute('aria-invalid', 'true'); const error = document.createElement('small'); error.className = 'field-error'; error.textContent = field.validationMessage || 'Check this field.'; field.insertAdjacentElement('afterend', error); };
  const valid = () => {
    setCustomValidity(); const current = steps.find((item) => Number(item.dataset.routeStep) === step);
    const invalid = Array.from(current.querySelectorAll('input,select')).find((field) => !field.checkValidity());
    if (invalid) { showFieldError(invalid); invalid.reportValidity(); return false; }
    if (step === 2 && !value('category')) { setStatus('Select a membership category to continue.', 'error'); return false; }
    if (step === 4 && !value('bank')) { setStatus('Select CRDB BANK or NBC BANK to continue.', 'error'); return false; }
    return true;
  };
  const renderReview = () => {
    review.innerHTML = [
      ['FULL NAME', [value('firstName'), value('middleName'), value('lastName')].filter(Boolean).join(' ')], ['EMAIL', value('email')], ['PHONE', value('phone')], ['CATEGORY', selectedCategory()],
      ['DATE OF BIRTH', value('dateOfBirth')], ['NATIONALITY', value('nationality')], ['REGION / DISTRICT', `${value('region')} / ${value('district')}`], ['BANK', selectedBank()]
    ].map(([label, text]) => `<div><span>${label}</span><strong>${escapeHtml(text || 'Not provided')}</strong></div>`).join('');
  };
  const show = (nextStep) => {
    step = nextStep; steps.forEach((item) => { item.hidden = Number(item.dataset.routeStep) !== step; });
    indicators.forEach((item) => { const number = Number(item.dataset.routeStepIndicator); item.classList.toggle('is-active', number === step); item.classList.toggle('is-complete', number < step); });
    back.hidden = step === 1; next.hidden = step === 5; submit.hidden = step !== 5; if (step === 5) renderReview(); setStatus(''); updateSelection();
    window.scrollTo({ top: document.querySelector('.membership-route-form-section')?.offsetTop - 24 || 0, behavior: 'smooth' });
  };
  const payload = () => ({ firstName: value('firstName'), middleName: value('middleName'), lastName: value('lastName'), phone: value('phone'), email: value('email'), password: value('password'), category: value('category'), dateOfBirth: value('dateOfBirth'), nationality: value('nationality'), region: value('region'), district: value('district'), gender: value('gender'), residentialLocation: value('residentialLocation'), bank: value('bank') });

  categoryCards.forEach((card) => card.addEventListener('click', () => { card.querySelector('input').checked = true; updateSelection(); }));
  bankCards.forEach((card) => card.addEventListener('click', () => { card.querySelector('input').checked = true; updateSelection(); }));
  form.addEventListener('input', (event) => { setCustomValidity(); if (event.target.matches('input,select')) clearFieldError(event.target); });
  next.addEventListener('click', () => { if (valid()) show(Math.min(5, step + 1)); });
  back.addEventListener('click', () => show(Math.max(1, step - 1)));
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); if (!valid()) return;
    submit.disabled = true; next.disabled = true; back.disabled = true; submit.textContent = 'SAVING APPLICATION...'; setStatus('Validating and saving your application...', 'info');
    try {
      const response = await window.MembershipClient.register(payload());
      form.hidden = true; success.hidden = false;
      success.querySelector('[data-app-reference]').textContent = response.application.reference;
      success.querySelector('[data-app-name]').textContent = response.application.fullName;
      success.querySelector('[data-app-category]').textContent = response.application.categoryName || selectedCategory();
      success.querySelector('[data-app-bank]').textContent = response.application.bankName || selectedBank();
      success.querySelector('[data-app-status]').textContent = response.application.status || 'Pending Review';
      successCopy.textContent = response.mode === 'demo' ? 'Your application is saved in this browser demo. Configure the secure membership API and database before accepting real supporter data.' : 'Your membership application has been saved successfully. You can sign in to view its progress.';
      window.scrollTo({ top: success.offsetTop - 24, behavior: 'smooth' });
    } catch (error) {
      setStatus(error.message || 'We could not save the application. Please try again.', 'error'); submit.disabled = false; next.disabled = false; back.disabled = false; submit.textContent = 'SUBMIT APPLICATION';
    }
  });
  const queryCategory = new URLSearchParams(window.location.search).get('category'); if (queryCategory && form.elements.category) form.elements.category.value = queryCategory;
  show(1);
})();
