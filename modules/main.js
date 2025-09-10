import {
  formatCardNumber,
  formatCVVCode,
  formatExpiryDate,
  getRandomInt
} from './utils.js'
import {validators} from './validators.js'

const TOTAL_IMAGES = 14;

const selectors = {
  card: '.js-card',
  form: '.js-form',
  fieldError: '.js-form-field-error'
};

const randomCardImage = `url(../images/wallpaper-${getRandomInt(
  TOTAL_IMAGES
)}.jpeg)`;

const card = document.querySelector(selectors.card);
card.style.setProperty('--card-background-image', randomCardImage);

const form = document.querySelector(selectors.form);
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
  const fieldError = field.querySelector(selectors.fieldError);
  fieldError.textContent = error ? error : '';
  control.setAttribute('aria-invalid', String(!!error));
};

const validateField = (control) => {
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
    validateField(target);
  }
}, { capture: true });

form.addEventListener('submit', (event) => {
  event.preventDefault();
});