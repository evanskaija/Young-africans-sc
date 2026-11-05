const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+ ()-]{7,}$/;
const CATEGORIES = new Set(['category-01', 'category-02', 'category-03']);
const BANKS = new Set(['crdb', 'nbc']);

const validateRegistration = (input = {}) => {
  const errors = {};
  const required = ['firstName', 'lastName', 'phone', 'email', 'password', 'category', 'dateOfBirth', 'nationality', 'region', 'district', 'bank'];
  required.forEach((field) => { if (!String(input[field] || '').trim()) errors[field] = 'This field is required.'; });
  if (input.email && !EMAIL.test(String(input.email).trim())) errors.email = 'Enter a valid email address.';
  if (input.phone && !PHONE.test(String(input.phone).trim())) errors.phone = 'Enter a valid phone number.';
  if (input.password && String(input.password).length < 8) errors.password = 'Password must be at least eight characters.';
  if (input.category && !CATEGORIES.has(input.category)) errors.category = 'Choose an available demonstration category.';
  if (input.bank && !BANKS.has(input.bank)) errors.bank = 'Choose CRDB BANK or NBC BANK.';
  return errors;
};

module.exports = { validateRegistration, CATEGORIES, BANKS };
