import {getRandomInt} from './utils.js'

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
// const cardNumberControl = form.cardNumber;
// const cardExpiryControl = form.cardExpiry;
// const cardSecurityCodeControl = form.cardSecurityCode;

const validators = {
  required: (message) => ({
    validate: (value) => value.trim() !== '',
    message
  }),
  email: (message) => ({
    validate: (value) => /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d-]+\.[a-z]{2,}$/i.test(value),
    message
  }),
  card: (message) => ({
    validate: (value) => true,
    message
  }),
  expiry: (message) => ({
    validate: (value) => true,
    message
  }),
  cvv: (message) => ({
    validate: (value) => true,
    message
  })
};

const validationConfig = {
  email: [validators.required('Enter your email'), validators.email('Incorrect email')],
  cardNumber: [validators.required('Enter your card'), validators.card('Incorrect card')],
  cardHolder: [validators.required('Enter your full name')],
  cardExpiry: [validators.required('Enter your expiry'), validators.expiry('Incorrect expiry')],
  cardSecurityCode: [validators.required('Enter your CVV'), validators.cvv('Incorrect CVV')]
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

form.addEventListener('blur', (event) => {
  event.preventDefault();
  const target = event.target;
  if (target.required) {
    validateField(target);
  }
}, { capture: true });