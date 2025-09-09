export const getRandomInt = (max) => {
  return Math.floor(Math.random() * max + 1);
};

export const validCard = (card) => {
  const formatted = card.replace(/\D/g, '');
  let sum = 0;
  let even = false;
  
  for (let index = formatted.length - 1; index >= 0; index--) {
    let digit = +formatted[index];
    
    if (even && (digit *= 2) > 9) {
      digit -= 9;
    }
    
    sum += digit;
    even = !even;
  }
  
  return sum % 10 === 0;
}