(() => {
  const STORE_KEY = 'ysc-membership-demo-v5';
  const CATEGORY_NAMES = {
    'category-01': 'Club Membership',
    'category-02': 'Supporter Membership',
    'category-03': 'Need registration guidance'
  };
  const IDENTIFICATION_NAMES = {
    nida: 'NIDA / NIN (demo)',
    passport: 'Passport (demo)',
    'voter-id': 'Voter ID (demo)',
    'drivers-license': 'Driver licence (demo)'
  };
  const REGISTRATION_ROUTE_NAMES = {
    'official-link': 'Official registration instructions',
    'staff-guidance': 'Authorized staff guidance'
  };

  const setMode = (mode) => {
    window.membershipSystemMode = mode;
    document.documentElement.dataset.membershipMode = mode;
  };
  const readStore = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return { users: [], applications: [], serviceRequests: [], sessionUserId: null, ...parsed };
    } catch (error) {
      return { users: [], applications: [], serviceRequests: [], sessionUserId: null };
    }
  };
  const writeStore = (store) => localStorage.setItem(STORE_KEY, JSON.stringify(store));
  const id = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const reference = (prefix = 'DEMO-YS') => `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const normaliseEmail = (email) => String(email || '').trim().toLowerCase();
  const maskIdentification = (value) => {
    const clean = String(value || '').trim().toUpperCase();
    if (!clean) return '';
    return `${clean.slice(0, -4).replace(/[A-Z0-9]/g, '•')}${clean.slice(-4)}`;
  };
  const parseResponse = async (response) => {
    const raw = await response.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch (error) { data = {}; }
    if (!response.ok) {
      const failure = new Error(data.message || 'The membership service is unavailable.');
      failure.status = response.status;
      throw failure;
    }
    return data;
  };
  const request = async (path, options = {}) => {
    const response = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    return parseResponse(response);
  };
  const canUseFallback = (error) => error?.name === 'TypeError' || [404, 405, 501, 503].includes(error?.status);

  const demoRegister = async (payload) => {
    const store = readStore();
    const email = normaliseEmail(payload.email);
    if (store.users.some((user) => user.email === email)) {
      const error = new Error('A request already exists for this email address. Use MY YANGA setup only after official membership is issued.');
      error.code = 'DUPLICATE_EMAIL';
      throw error;
    }
    const user = {
      id: id('demo-user'),
      firstName: payload.firstName,
      middleName: payload.middleName || '',
      lastName: payload.lastName,
      email,
      phone: payload.phone,
      createdAt: new Date().toISOString(),
      officialMembershipNumber: null
    };
    const application = {
      id: id('demo-registration'),
      reference: reference('YSC-REG'),
      userId: user.id,
      fullName: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
      email,
      phone: user.phone,
      category: payload.category,
      categoryName: CATEGORY_NAMES[payload.category] || 'Membership path',
      dateOfBirth: payload.dateOfBirth,
      nationality: payload.nationality,
      region: payload.region,
      district: payload.district,
      gender: payload.gender || '',
      residentialLocation: payload.residentialLocation || '',
      identificationType: payload.identificationType,
      identificationTypeName: IDENTIFICATION_NAMES[payload.identificationType] || 'Identification (demo)',
      identificationNumberMasked: maskIdentification(payload.identificationNumber),
      registrationRoute: payload.registrationRoute,
      registrationRouteName: REGISTRATION_ROUTE_NAMES[payload.registrationRoute] || 'Authorized guidance',
      membershipStatus: 'NOT_ISSUED',
      status: 'Pending Review',
      submittedAt: new Date().toISOString()
    };
    store.users.push(user);
    store.applications.push(application);
    store.sessionUserId = null;
    writeStore(store);
    setMode('demo');
    return { ok: true, mode: 'demo', user, application, next: 'official-registration' };
  };

  const demoMe = () => {
    const store = readStore();
    const user = store.users.find((item) => item.id === store.sessionUserId);
    if (!user) {
      const error = new Error('Please sign in to continue.');
      error.status = 401;
      throw error;
    }
    return {
      ok: true,
      mode: 'demo',
      user,
      application: store.applications.find((item) => item.userId === user.id) || null,
      serviceRequests: store.serviceRequests.filter((item) => item.userId === user.id)
    };
  };
  const demoLogin = async () => {
    throw new Error('Official member login is unavailable until an authorized membership source links your official membership number. Use Set Up Account for staff-assisted verification.');
  };
  const demoSetupRequest = async (payload) => {
    if (payload.action !== 'staff-request') {
      const error = new Error('Official membership verification is unavailable until an authorized source is connected.');
      error.status = 503;
      throw error;
    }
    return {
      ok: true,
      mode: 'demo',
      status: 'AWAITING_STAFF_VERIFICATION',
      reference: reference('SETUP'),
      message: 'Staff-assisted verification is pending in this browser demo. No account or OTP was created.'
    };
  };
  const demoServiceRequest = async (payload) => {
    const store = readStore();
    const user = store.users.find((item) => item.id === store.sessionUserId);
    if (!user) throw new Error('Please sign in to continue.');
    const item = { id: id('demo-request'), userId: user.id, category: payload.category, description: payload.description, reference: reference('CASE'), status: 'OPEN', createdAt: new Date().toISOString() };
    store.serviceRequests.push(item);
    writeStore(store);
    return { ok: true, mode: 'demo', request: item };
  };
  const callWithFallback = async (serverCall, fallbackCall) => {
    try {
      const response = await serverCall();
      setMode('server');
      return response;
    } catch (error) {
      if (!canUseFallback(error)) throw error;
      return fallbackCall();
    }
  };

  window.MembershipClient = {
    categoryNames: CATEGORY_NAMES,
    identificationNames: IDENTIFICATION_NAMES,
    registrationRouteNames: REGISTRATION_ROUTE_NAMES,
    maskIdentification,
    register: (payload) => callWithFallback(() => request('/api/membership/register', { method: 'POST', body: JSON.stringify(payload) }), () => demoRegister(payload)),
    login: (payload) => callWithFallback(() => request('/api/membership/login', { method: 'POST', body: JSON.stringify(payload) }), () => demoLogin(payload)),
    me: () => callWithFallback(() => request('/api/membership/me'), () => demoMe()),
    status: () => callWithFallback(() => request('/api/membership/application-status'), () => demoMe()),
    serviceRequests: () => callWithFallback(() => request('/api/membership/service-requests'), () => demoMe()),
    submitServiceRequest: (payload) => callWithFallback(() => request('/api/membership/service-requests', { method: 'POST', body: JSON.stringify(payload) }), () => demoServiceRequest(payload)),
    notifications: () => callWithFallback(() => request('/api/membership/notifications'), () => ({ ok: true, mode: 'demo', notifications: [] })),
    setupRequest: (payload) => callWithFallback(() => request('/api/membership/setup', { method: 'POST', body: JSON.stringify(payload) }), () => demoSetupRequest(payload)),
    logout: () => callWithFallback(() => request('/api/membership/logout', { method: 'POST', body: '{}' }), () => { const store = readStore(); store.sessionUserId = null; writeStore(store); setMode('demo'); return { ok: true }; }),
    adminList: (query = '') => request(`/api/admin/membership${query ? `?q=${encodeURIComponent(query)}` : ''}`),
    adminUpdate: (idValue, status) => request('/api/admin/membership', { method: 'PATCH', body: JSON.stringify({ id: idValue, status }) }),
    adminSetupRequests: () => request('/api/admin/setup-requests'),
    adminUpdateSetupRequest: (idValue, status) => request('/api/admin/setup-requests', { method: 'PATCH', body: JSON.stringify({ id: idValue, status }) }),
    adminServiceRequests: () => request('/api/admin/service-requests'),
    adminUpdateServiceRequest: (idValue, status, staffResponse = '') => request('/api/admin/service-requests', { method: 'PATCH', body: JSON.stringify({ id: idValue, status, staffResponse }) })
  };
})();
