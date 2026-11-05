(() => {
  const STORE_KEY = 'ysc-membership-demo-v2';
  const CATEGORY_NAMES = {
    'category-01': 'Club Membership',
    'category-02': 'Supporter Membership',
    'category-03': 'Additional Category'
  };
  const BANK_NAMES = { crdb: 'CRDB BANK', nbc: 'NBC BANK' };

  const setMode = (mode) => {
    window.membershipSystemMode = mode;
    document.documentElement.dataset.membershipMode = mode;
  };
  const readStore = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{"users":[],"applications":[],"sessionUserId":null}'); }
    catch (error) { return { users: [], applications: [], sessionUserId: null }; }
  };
  const writeStore = (store) => localStorage.setItem(STORE_KEY, JSON.stringify(store));
  const id = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const reference = () => `DEMO-YS-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const normaliseEmail = (email) => String(email || '').trim().toLowerCase();

  const digest = async (password, salt) => {
    const input = `${salt}:${password}`;
    if (window.crypto?.subtle && window.TextEncoder) {
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
      return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    }
    return btoa(unescape(encodeURIComponent(input)));
  };
  const parseResponse = async (response) => {
    const raw = await response.text(); let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch (error) { data = {}; }
    if (!response.ok) { const failure = new Error(data.message || 'The membership service is unavailable.'); failure.status = response.status; throw failure; }
    return data;
  };
  const request = async (path, options = {}) => {
    const response = await fetch(path, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    return parseResponse(response);
  };
  const canUseFallback = (error) => error?.name === 'TypeError' || [404, 405, 501, 503].includes(error?.status);

  const demoRegister = async (payload) => {
    const store = readStore(); const email = normaliseEmail(payload.email);
    if (store.users.some((user) => user.email === email)) { const error = new Error('An account already exists for this email address. Try signing in instead.'); error.code = 'DUPLICATE_EMAIL'; throw error; }
    const salt = id('salt');
    const user = { id: id('demo-user'), firstName: payload.firstName, middleName: payload.middleName || '', lastName: payload.lastName, email, phone: payload.phone, passwordSalt: salt, passwordDigest: await digest(payload.password, salt), createdAt: new Date().toISOString() };
    const application = { id: id('demo-application'), reference: reference(), userId: user.id, fullName: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '), email: user.email, phone: user.phone, category: payload.category, categoryName: CATEGORY_NAMES[payload.category] || 'Demonstration category', dateOfBirth: payload.dateOfBirth, nationality: payload.nationality, region: payload.region, district: payload.district, gender: payload.gender || '', residentialLocation: payload.residentialLocation || '', bank: payload.bank, bankName: BANK_NAMES[payload.bank] || 'Demonstration bank', status: 'Pending Review', submittedAt: new Date().toISOString() };
    store.users.push(user); store.applications.push(application); store.sessionUserId = user.id; writeStore(store); setMode('demo');
    return { ok: true, mode: 'demo', user: { ...user, passwordSalt: undefined, passwordDigest: undefined }, application };
  };
  const demoLogin = async ({ email, password }) => {
    const store = readStore(); const user = store.users.find((item) => item.email === normaliseEmail(email));
    if (!user || (await digest(password, user.passwordSalt)) !== user.passwordDigest) throw new Error('Email or password is incorrect.');
    store.sessionUserId = user.id; writeStore(store); setMode('demo'); return demoMe();
  };
  const demoMe = () => {
    const store = readStore(); const user = store.users.find((item) => item.id === store.sessionUserId);
    if (!user) { const error = new Error('Please sign in to continue.'); error.status = 401; throw error; }
    const application = store.applications.find((item) => item.userId === user.id) || null;
    return { ok: true, mode: 'demo', user: { ...user, passwordSalt: undefined, passwordDigest: undefined }, application };
  };
  const callWithFallback = async (serverCall, fallbackCall) => { try { const response = await serverCall(); setMode('server'); return response; } catch (error) { if (!canUseFallback(error)) throw error; return fallbackCall(); } };

  window.MembershipClient = {
    categoryNames: CATEGORY_NAMES,
    bankNames: BANK_NAMES,
    register: (payload) => callWithFallback(() => request('/api/membership/register', { method: 'POST', body: JSON.stringify(payload) }), () => demoRegister(payload)),
    login: (payload) => callWithFallback(() => request('/api/membership/login', { method: 'POST', body: JSON.stringify(payload) }), () => demoLogin(payload)),
    me: () => callWithFallback(() => request('/api/membership/me'), () => demoMe()),
    status: () => callWithFallback(() => request('/api/membership/application-status'), () => demoMe()),
    logout: () => callWithFallback(() => request('/api/membership/logout', { method: 'POST', body: '{}' }), () => { const store = readStore(); store.sessionUserId = null; writeStore(store); setMode('demo'); return { ok: true }; }),
    adminList: (query = '') => request(`/api/admin/membership${query ? `?q=${encodeURIComponent(query)}` : ''}`),
    adminUpdate: (idValue, status) => request('/api/admin/membership', { method: 'PATCH', body: JSON.stringify({ id: idValue, status }) })
  };
})();
