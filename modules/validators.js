import { checkLuhn, getCardType } from './utils.js';

const EMAIL_REGEXP = /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d-]+\.[a-z]{2,}$/;

const requiredValidator = (value) => value.trim() !== '';

const emailValidator = (email) => EMAIL_REGEXP.test(email);

const cardNumberValidator = (number) => {
  const sanitized = number.replace(/\D/g, '');
  const type = getCardType(sanitized);

  return type === 'unknown' ? false : checkLuhn(sanitized);
};

const expiryDateValidator = (date) => {
  const [month, year] = date.split('/').map(Number);
  if (!month || !year || month > 12) {
    return false;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  return year > currentYear || (year === currentYear && month >= currentMonth);
};

const CVVCodeValidator = (cvv) => /^\d{3}$/.test(cvv);

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
  cvv: (message) => ({
    validate: CVVCodeValidator,
    message
  })
};

export default validators;
