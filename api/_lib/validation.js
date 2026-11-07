const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+ ()-]{7,}$/;
const CATEGORIES = new Set(['category-01', 'category-02', 'category-03']);
const IDENTIFICATION_TYPES = new Set(['nida', 'passport', 'voter-id', 'drivers-license']);
const REGISTRATION_ROUTES = new Set(['official-link', 'staff-guidance']);
const DEMO_ID_PATTERNS = {
  nida: /^NIDA-DEMO-[0-9]{8}$/i,
  passport: /^[A-Z0-9]+-DEMO-[A-Z0-9-]{4,}$/i,
  'voter-id': /^[A-Z0-9]+-DEMO-[A-Z0-9-]{4,}$/i,
  'drivers-license': /^[A-Z0-9]+-DEMO-[A-Z0-9-]{4,}$/i
};

const validateRegistration = (input = {}) => {
  const errors = {};
  const required = ['firstName', 'lastName', 'phone', 'email', 'category', 'dateOfBirth', 'nationality', 'region', 'district', 'identificationType', 'identificationNumber', 'identificationReason', 'registrationRoute', 'termsAccepted'];
  required.forEach((field) => {
    if (field === 'termsAccepted' ? input[field] !== true : !String(input[field] || '').trim()) {
      errors[field] = field === 'termsAccepted' ? 'Accept the registration request terms.' : 'This field is required.';
    }
  });
  if (input.email && !EMAIL.test(String(input.email).trim())) errors.email = 'Enter a valid email address.';
  if (input.phone && !PHONE.test(String(input.phone).trim())) errors.phone = 'Enter a valid phone number.';
  if (input.category && !CATEGORIES.has(input.category)) errors.category = 'Choose a supported membership path.';
  if (input.registrationRoute && !REGISTRATION_ROUTES.has(input.registrationRoute)) errors.registrationRoute = 'Choose an authorized next-step option.';
  if (input.identificationType && !IDENTIFICATION_TYPES.has(input.identificationType)) errors.identificationType = 'Choose an approved demonstration identification type.';
  if (input.identificationType && input.identificationNumber && !DEMO_ID_PATTERNS[input.identificationType]?.test(String(input.identificationNumber).trim())) errors.identificationNumber = 'Use a synthetic demonstration identification number only.';
  if (input.identificationDetailsConfirmed !== true) errors.identificationDetailsConfirmed = 'Confirm that the identification details are synthetic demo data.';
  if (input.identificationReason && String(input.identificationReason).trim().length < 12) errors.identificationReason = 'Explain why identification is requested.';
  return errors;
};

module.exports = { validateRegistration, CATEGORIES, REGISTRATION_ROUTES, IDENTIFICATION_TYPES, DEMO_ID_PATTERNS };
