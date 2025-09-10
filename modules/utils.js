export const getRandomInt = (max) => {
  return Math.floor(Math.random() * max + 1);
};

export const formatCardNumber = (number) => {
  const formatted = number.replace(/\D/g, '').slice(0, 16);
  return formatted.replace(/(\d{4})/g, '$1 ').trim()
};

export const formatExpiryDate = (date) => {
  const formatted = date.replace(/\D/g, '').slice(0, 4);
  return formatted.length > 2 ? formatted.replace(/(\d{2})(\d{1,2})/, '$1/$2') : formatted;
};