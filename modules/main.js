import {formatCardNumber, formatCVVCode, formatExpiryDate} from './utils.js'
import {validators} from './validators.js'
import {SELECTORS} from './selectors.js'
import {generateRandomCardImage} from './random-card-image.js'

generateRandomCardImage();

const form = document.querySelector(SELECTORS.form);
const cardNumberControl = form.cardNumber;
const cardExpiryDateControl = form.cardExpiryDate;
const cardCVVCodeControl = form.cardCVVCode;

const validationConfig = {
  email: [validators.required('Enter your email'), validators.email('Incorrect email')],
  cardNumber: [validators.required('Enter your card number'), validators.cardNumber('Incorrect card number')],
  cardHolder: [validators.required('Enter your full name')],
  cardExpiryDate: [validators.required('Enter your expiry date'), validators.expiryDate('Incorrect expiry date')],
  cardCVVCode: [validators.required('Enter your CVV'), validators.cvv('Incorrect CVV')]
};

const updateError = (control, error) => {
  const field = control.parentElement;
  field.classList.toggle('has-error', !!error);
  const fieldError = field.querySelector(SELECTORS.fieldError);
  fieldError.textContent = error ? error : '';
  control.setAttribute('aria-invalid', String(!!error));
};

const validateControl = (control) => {
  if (!validationConfig[control.id]) {
    return;
  }
  
  let error;
  for (const validator of validationConfig[control.id]) {
    if (!validator.validate(control.value)) {
      error = validator.message;
      break;
    }
  }
  
  updateError(control, error);
};

cardNumberControl.addEventListener('input', (event) => {
  const target = event.target;
  target.value = formatCardNumber(target.value);
});

cardExpiryDateControl.addEventListener('input', (event) => {
  const target = event.target;
  target.value = formatExpiryDate(target.value);
});

cardCVVCodeControl.addEventListener('input', (event) => {
  const target = event.target;
  target.value = formatCVVCode(target.value);
});

form.addEventListener('blur', (event) => {
  const target = event.target;
  if (target.required) {
    validateControl(target);
  }
}, { capture: true });

form.addEventListener('submit', (event) => {
  event.preventDefault();
});