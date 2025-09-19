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

const HIGHLIGHT_ANIMATION_MS = 300;

class CardForm {
  selectors = {
    form: '.js-form',
    fieldError: '.js-form-field-error',
    card: '.js-card',
    cardHighlighter: '.js-card-highlighter',
    cardNumber: '.js-card-number',
    cardHolder: '.js-card-holder',
    cardExpiryDate: '.js-card-expiry-date'
  };

  stateClasses = {
    flip: 'flip',
    highlight: 'highlight',
    hasError: 'has-error'
  };

  stateAttributes = {
    ariaInvalid: 'aria-invalid'
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
    this.card = document.querySelector(this.selectors.card);
    this.cardHighlighter = document.querySelector(
      this.selectors.cardHighlighter
    );
    this.highlightableElements = {
      cardNumber: document.querySelector(this.selectors.cardNumber),
      cardHolder: document.querySelector(this.selectors.cardHolder),
      cardExpiryDate: document.querySelector(this.selectors.cardExpiryDate)
    };
    this.fieldFocused = false;
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
      case 'unknown':
      default:
        this.cardNumberControl.maxLength = CARD_NUMBER_DEFAULT_MASK.length;
        this.cardCVVCodeControl.maxLength = CVV_DEFAULT_MASK.length;
        this.cardCVVCodeControl.placeholder = CVV_DEFAULT_MASK;
        break;
    }
  }

  updateError(control, errorMessage) {
    const field = control.parentElement;
    const fieldError = field.querySelector(this.selectors.fieldError);
    const hasError = !!errorMessage;

    field.classList.toggle(this.stateClasses.hasError, hasError);
    fieldError.textContent = errorMessage || '';
    control.setAttribute(this.stateAttributes.ariaInvalid, String(hasError));
  }

  validateControl(control) {
    if (!this.validationConfig[control.id]) {
      return;
    }

    let errorMessage;
    for (const validator of this.validationConfig[control.id]) {
      if (!validator.validate(control.value)) {
        errorMessage = validator.message;
        break;
      }
    }

    this.updateError(control, errorMessage);

    return !errorMessage;
  }

  tabForward(control) {
    if (control.value.length === control.maxLength && control.dataset.next) {
      this.form[control.dataset.next].focus();
    }
  }

  highlight(element) {
    const { offsetWidth, offsetHeight, offsetTop, offsetLeft } = element;

    this.fieldFocused = true;

    Object.assign(this.cardHighlighter.style, {
      width: `${offsetWidth}px`,
      height: `${offsetHeight}px`,
      translate: `${offsetLeft}px ${offsetTop}px`
    });

    this.cardHighlighter.classList.add(this.stateClasses.highlight);
  }

  clearHighlight() {
    Object.assign(this.cardHighlighter.style, {
      width: '',
      height: '',
      translate: ''
    });
    this.cardHighlighter.classList.remove(this.stateClasses.highlight);
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
    if (target.required) {
      this.validateControl(target);
    }

    this.card.classList.remove(this.stateClasses.flip);
    this.fieldFocused = false;

    setTimeout(() => {
      if (!this.fieldFocused) {
        this.clearHighlight();
      }
    }, HIGHLIGHT_ANIMATION_MS);
  };

  onFocus = (event) => {
    const target = event.target;
    const highlightableElement = this.highlightableElements[target.id];

    if (highlightableElement) {
      this.highlight(highlightableElement);
    }

    if (target === this.cardCVVCodeControl) {
      this.card.classList.add(this.stateClasses.flip);
    }
  };

  onSubmit = (event) => {
    const requiredControls = [...this.form.elements].filter(
      (control) => control.required
    );
    let formValid = true;
    let firstInvalidControl = null;

    requiredControls.forEach((control) => {
      if (!this.validateControl(control)) {
        formValid = false;
        if (!firstInvalidControl) {
          firstInvalidControl = control;
        }
      }
    });

    if (!formValid) {
      event.preventDefault();
      firstInvalidControl.focus();
    }
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
    this.form.addEventListener('focus', this.onFocus, { capture: true });
    this.form.addEventListener('submit', this.onSubmit);
  }
}

export default CardForm;
