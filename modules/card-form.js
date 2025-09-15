import validators from './validators.js';
import {
  formatCardNumber,
  formatCVVCode,
  formatExpiryDate,
  getCardType
} from './utils.js';

const CARD_NUMBER_DEFAULT_MASK = 'XXXX XXXX XXXX XXXX';
const CARD_NUMBER_AMEX_MASK = 'XXXX XXXXXX XXXXX';

const CVV_DEFAULT_MASK = 'XXX';
const CVV_AMEX_MASK = 'XXXX';

class CardForm {
  selectors = {
    form: '.js-form',
    fieldError: '.js-form-field-error'
  };

  validationConfig = {
    cardNumber: [
      validators.required('Enter your card number'),
      validators.cardNumber('Incorrect card number')
    ],
    cardHolder: [validators.required('Enter your full name')],
    cardExpiryDate: [
      validators.required('Enter your expiry date'),
      validators.expiryDate('Incorrect expiry date')
    ],
    cardCVVCode: [
      validators.required('Enter your CVV'),
      validators.cvv('Incorrect CVV')
    ],
    email: [
      validators.required('Enter your email'),
      validators.email('Incorrect email')
    ]
  };

  constructor() {
    this.form = document.querySelector(this.selectors.form);
    this.cardNumberControl = this.form.cardNumber;
    this.cardHolderControl = this.form.cardHolder;
    this.cardExpiryDateControl = this.form.cardExpiryDate;
    this.cardCVVCodeControl = this.form.cardCVVCode;
    this.bindEvents();
  }

  updateCardType(type) {
    switch (type) {
      case 'amex':
        this.cardNumberControl.maxLength = CARD_NUMBER_AMEX_MASK.length;
        this.cardCVVCodeControl.maxLength = CVV_AMEX_MASK.length;
        this.cardCVVCodeControl.placeholder = CVV_AMEX_MASK;
        break;
      case 'visa':
      case 'mastercard':
      case 'discover':
      default:
        this.cardNumberControl.maxLength = CARD_NUMBER_DEFAULT_MASK.length;
        this.cardCVVCodeControl.maxLength = CVV_DEFAULT_MASK.length;
        this.cardCVVCodeControl.placeholder = CVV_DEFAULT_MASK;
        break;
    }
  }

  updateError(control, error) {
    const field = control.parentElement;
    field.classList.toggle('has-error', !!error);
    const fieldError = field.querySelector(this.selectors.fieldError);
    fieldError.textContent = error ? error : '';
    control.setAttribute('aria-invalid', String(!!error));
  }

  validateControl(control) {
    if (!this.validationConfig[control.id]) {
      return;
    }

    let error;
    for (const validator of this.validationConfig[control.id]) {
      if (!validator.validate(control.value)) {
        error = validator.message;
        break;
      }
    }

    this.updateError(control, error);
  }

  tabForward(control) {
    control.value.length === control.maxLength &&
      this.form[control.dataset.next]?.focus();
  }

  onCardNumberInput = (event) => {
    const target = event.target;
    const formatted = formatCardNumber(target.value);
    target.value = formatted;

    this.updateCardType(getCardType(formatted));
    this.tabForward(target);
  };

  onCardExpiryDateInput = (event) => {
    const target = event.target;
    target.value = formatExpiryDate(target.value);

    this.tabForward(target);
  };

  onCardCVVCodeInput = (event) => {
    const target = event.target;
    target.value = formatCVVCode(target.value);
  };

  onBlur = (event) => {
    const target = event.target;
    target.required && this.validateControl(target);
  };

  onSubmit = (event) => {
    event.preventDefault();
  };

  bindEvents() {
    this.cardNumberControl.addEventListener('input', this.onCardNumberInput);
    this.cardHolderControl.addEventListener('input', (event) =>
      this.tabForward(event.target)
    );
    this.cardExpiryDateControl.addEventListener(
      'input',
      this.onCardExpiryDateInput
    );
    this.cardCVVCodeControl.addEventListener('input', this.onCardCVVCodeInput);
    this.form.addEventListener('blur', this.onBlur, { capture: true });
    this.form.addEventListener('submit', this.onSubmit);
  }
}

export default CardForm;
