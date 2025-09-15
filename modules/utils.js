export const getRandomInt = (max) => {
  return Math.floor(Math.random() * max + 1);
};

export const getCardType = (number) => {
  const cardPatterns = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
  };

  for (const [card, pattern] of Object.entries(cardPatterns)) {
    if (pattern.test(number)) {
      return card;
    }
  }

  return 'unknown';
};

export const getCardMaskType = (number) => {
  const cardPatterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(011|5)/
  };

  for (const [card, pattern] of Object.entries(cardPatterns)) {
    if (pattern.test(number)) {
      return card;
    }
  }

  return 'unknown';
};

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

export const formatCardNumber = (number) => {
  const sanitized = number.replace(/\D/g, '');
  const type = getCardMaskType(sanitized);

  switch (type) {
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
    default:
      return sanitized.slice(0, 16);
  }
};

export const formatExpiryDate = (date) => {
  const sanitized = date.replace(/\D/g, '').slice(0, 4);
  return sanitized.length > 2
    ? sanitized.replace(/(\d{2})(\d{1,2})/, '$1/$2')
    : sanitized;
};

export const formatCVVCode = (cvv) => {
  return cvv.replace(/\D/g, '');
};
