export const getRandomInt = (max) => {
  return Math.floor(Math.random() * max + 1);
};

export const formatCardNumber = (number) => number.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();