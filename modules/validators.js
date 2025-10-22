import { checkLuhn, sanitizeDigits } from './utils.js';

const EMAIL_REGEXP = /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d-]+\.[a-z]{2,}$/;

const requiredValidator = (value) => value.trim() !== '';

const emailValidator = (email) => EMAIL_REGEXP.test(email);

const cardNumberValidator = (number) => {
  const sanitized = sanitizeDigits(number);
  const cardPatterns = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
  };

  const matchesPattern = Object.values(cardPatterns).some((pattern) =>
    pattern.test(sanitized)
  );

  return !matchesPattern ? false : checkLuhn(sanitized);
};

const expiryDateValidator = (date) => {
  const sanitized = date.split('/').map(Number);
  const month = sanitized[0];
  const year = sanitized[1];
  if (!month || !year || month > 12) {
    return false;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  return year > currentYear || (year === currentYear && month >= currentMonth);
};

const CvcValidator = (cvc) => /^\d{3,4}$/.test(cvc);

const validators = {
  required: (message) => ({
    validate: requiredValidator,
    message
  }),
  email: (message) => ({
    validate: emailValidator,
    message
  }),
  cardNumber: (message) => ({
    validate: cardNumberValidator,
    message
  }),
  expiryDate: (message) => ({
    validate: expiryDateValidator,
    message
  }),
  cvc: (message) => ({
    validate: CvcValidator,
    message
  })
};

export default validators;
