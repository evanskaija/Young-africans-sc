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
  const routeCards = Array.from(form.querySelectorAll('[data-registration-route-card]'));
  let step = 1;

  const value = (name) => String(form.elements[name]?.value || '').trim();
  const checked = (name) => Boolean(form.elements[name]?.checked);
  const escapeHtml = (text) => String(text || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
  const setStatus = (message, tone = '') => { status.textContent = message; status.dataset.tone = tone; };
  const selectedCategory = () => window.MembershipClient.categoryNames[value('category')] || 'Not selected';
  const selectedRoute = () => window.MembershipClient.registrationRouteNames[value('registrationRoute')] || 'Not selected';

  const updateSelection = () => {
    [...categoryCards, ...routeCards].forEach((card) => card.classList.toggle('is-selected', Boolean(card.querySelector('input')?.checked)));
  };

  const setCustomValidity = () => {
    const id = form.elements.identificationNumber;
    const type = value('identificationType');
    if (id && id.value) {
      const validDemo = type === 'nida'
        ? /^NIDA-DEMO-[0-9]{8}$/i.test(id.value.trim())
        : /^[A-Z0-9]+-DEMO-[A-Z0-9-]{4,}$/i.test(id.value.trim());
      id.setCustomValidity(validDemo ? '' : `Use a synthetic ${type === 'nida' ? 'NIDA-DEMO-12345678' : 'approved ID demo'} number.`);
    }
  };

  const clearFieldError = (field) => {
    field.removeAttribute('aria-invalid');
    field.parentElement?.querySelector('.field-error')?.remove();
  };

  const showFieldError = (field) => {
    clearFieldError(field);
    field.setAttribute('aria-invalid', 'true');
    const error = document.createElement('small');
    error.className = 'field-error';
    error.textContent = field.validationMessage || 'Check this field.';
    field.insertAdjacentElement('afterend', error);
  };

  const valid = () => {
    setCustomValidity();
    const current = steps.find((item) => Number(item.dataset.routeStep) === step);
    const invalid = Array.from(current.querySelectorAll('input,select,textarea')).find((field) => !field.checkValidity());
    if (invalid) {
      showFieldError(invalid);
      invalid.reportValidity();
      return false;
    }
    if (step === 2 && !value('category')) { setStatus('Select a membership path to continue.', 'error'); return false; }
    if (step === 3 && (!value('identificationType') || !value('identificationNumber') || !checked('identificationDetailsConfirmed') || !value('identificationReason'))) {
      setStatus('Complete the synthetic identification details before continuing.', 'error');
      return false;
    }
    if (step === 4 && !value('registrationRoute')) { setStatus('Choose how you want to continue.', 'error'); return false; }
    return true;
  };

  const renderReview = () => {
    const maskedId = window.MembershipClient.maskIdentification(value('identificationNumber')) || 'Not provided';
    const rows = [
      ['FULL NAME', [value('firstName'), value('middleName'), value('lastName')].filter(Boolean).join(' ')],
      ['EMAIL', value('email')],
      ['PHONE', value('phone')],
      ['MEMBERSHIP PATH', selectedCategory()],
      ['DATE OF BIRTH', value('dateOfBirth')],
      ['NATIONALITY', value('nationality')],
      ['REGION / DISTRICT', `${value('region')} / ${value('district')}`],
      ['IDENTIFICATION', `${window.MembershipClient.identificationNames[value('identificationType')] || 'Identification'} · ${maskedId}`],
      ['NEXT STEP', selectedRoute()],
      ['ACCOUNT ACCESS', 'Separate MY YANGA setup after official membership']
    ];
    review.innerHTML = rows.map(([label, text]) => `<div><span>${label}</span><strong>${escapeHtml(text || 'Not provided')}</strong></div>`).join('');
  };

  const show = (nextStep) => {
    step = nextStep;
    steps.forEach((item) => { item.hidden = Number(item.dataset.routeStep) !== step; });
    indicators.forEach((item) => {
      const number = Number(item.dataset.routeStepIndicator);
      item.classList.toggle('is-active', number === step);
      item.classList.toggle('is-complete', number < step);
    });
    back.hidden = step === 1;
    next.hidden = step === 5;
    submit.hidden = step !== 5;
    if (step === 5) renderReview();
    setStatus('');
    updateSelection();
    window.scrollTo({ top: document.querySelector('.membership-route-form-section')?.offsetTop - 24 || 0, behavior: 'smooth' });
  };

  const payload = () => ({
    firstName: value('firstName'),
    middleName: value('middleName'),
    lastName: value('lastName'),
    phone: value('phone'),
    email: value('email'),
    category: value('category'),
    dateOfBirth: value('dateOfBirth'),
    nationality: value('nationality'),
    region: value('region'),
    district: value('district'),
    gender: value('gender'),
    residentialLocation: value('residentialLocation'),
    identificationType: value('identificationType'),
    identificationNumber: value('identificationNumber'),
    identificationDetailsConfirmed: checked('identificationDetailsConfirmed'),
    identificationReason: value('identificationReason'),
    registrationRoute: value('registrationRoute'),
    termsAccepted: checked('terms')
  });

  [...categoryCards, ...routeCards].forEach((card) => card.addEventListener('click', () => {
    const input = card.querySelector('input');
    if (input) input.checked = true;
    updateSelection();
  }));

  form.addEventListener('input', (event) => {
    setCustomValidity();
    if (event.target.matches('input,select,textarea')) clearFieldError(event.target);
  });

  next.addEventListener('click', () => { if (valid()) show(Math.min(5, step + 1)); });
  back.addEventListener('click', () => show(Math.max(1, step - 1)));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!valid()) return;
    submit.disabled = true;
    next.disabled = true;
    back.disabled = true;
    submit.textContent = 'SAVING REQUEST...';
    setStatus('Saving your registration request...', 'info');
    try {
      const response = await window.MembershipClient.register(payload());
      form.hidden = true;
      success.hidden = false;
      success.querySelector('[data-app-reference]').textContent = response.application.reference;
      success.querySelector('[data-app-name]').textContent = response.application.fullName;
      success.querySelector('[data-app-category]').textContent = response.application.categoryName || selectedCategory();
      success.querySelector('[data-app-route]').textContent = window.MembershipClient.registrationRouteNames[response.application.registrationRoute] || selectedRoute();
      successCopy.textContent = response.mode === 'demo'
        ? 'DEMO REQUEST SAVED. No official membership number or MY YANGA login was created.'
        : 'Request saved with an internal reference. An authorized registration source must complete membership before MY YANGA setup can begin.';
    } catch (error) {
      setStatus(error.message || 'We could not save the request. Please try again.', 'error');
      submit.disabled = false;
      next.disabled = false;
      back.disabled = false;
      submit.innerHTML = 'SUBMIT REQUEST <span>&#8599;</span>';
    }
  });

  const queryCategory = new URLSearchParams(window.location.search).get('category');
  if (queryCategory) {
    const categoryInput = form.querySelector(`input[name="category"][value="${CSS.escape(queryCategory)}"]`);
    if (categoryInput) categoryInput.checked = true;
  }
  updateSelection();
  show(1);
})();
