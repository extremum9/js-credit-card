export const getRandomInt = (max) => {
  return Math.floor(Math.random() * max + 1);
};

export const sanitizeDigits = (value) => value.replace(/\D/g, '');

export const checkLuhn = (number) => {
  let sum = 0;
  let even = false;

  for (let index = number.length - 1; index >= 0; index--) {
    let digit = +number[index];
    if (even && (digit *= 2) > 9) {
      digit -= 9;
    }
    sum += digit;
    even = !even;
  }

  return sum % 10 === 0;
};

export const getCardType = (number) => {
  const cardPatterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(011|5)/
  };

  for (const card of Object.entries(cardPatterns)) {
    if (card[1].test(number)) {
      return card[0];
    }
  }

  return 'unknown';
};

export const formatCardNumber = (number) => {
  const sanitized = sanitizeDigits(number);

  switch (getCardType(sanitized)) {
    case 'amex':
      return sanitized
        .slice(0, 15)
        .replace(/(\d{4})(\d{0,6})(\d{0,5})/g, '$1 $2 $3')
        .trim();
    case 'visa':
    case 'mastercard':
    case 'discover':
      return sanitized
        .slice(0, 16)
        .replace(/(\d{4})/g, '$1 ')
        .trim();
    case 'unknown':
    default:
      return sanitized.slice(0, 16);
  }
};

export const formatExpiryDate = (date) => {
  const sanitized = sanitizeDigits(date).slice(0, 4);
  if (sanitized.length === 1 && +sanitized > 1) {
    return `0${sanitized}`;
  }

  return sanitized.length > 2
    ? sanitized.replace(/(\d{2})(\d{0,2})/, '$1/$2')
    : sanitized;
};

export const formatCVVCode = (cvv) => sanitizeDigits(cvv).slice(0, 4);
