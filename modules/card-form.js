import validators from './validators.js';
import {
  formatCardNumber,
  formatCVVCode,
  formatExpiryDate,
  getCardType
} from './utils.js';

const CARD_MASKS = {
  default: {
    number: 'XXXX XXXX XXXX XXXX',
    cvv: 'XXX'
  },
  amex: {
    number: 'XXXX XXXXXX XXXXX',
    cvv: 'XXXX'
  }
};

const HIGHLIGHT_ANIMATION_MS = 300;
const SLIDE_FADE_UP_ANIMATION_MS = 300;

class CardForm {
  selectors = {
    form: '.js-form',
    fieldError: '.js-form-field-error',
    card: '.js-card',
    cardHighlighter: '.js-card-highlighter',
    cardNumber: '.js-card-number',
    cardHolder: '.js-card-holder',
    cardExpiryDate: '.js-card-expiry-date',
    cardCVV: '.js-card-cvv'
  };

  stateClasses = {
    flip: 'flip',
    highlight: 'highlight',
    hasError: 'has-error',
    slideFadeUpEnterActive: 'slide-fade-up-enter-active',
    slideFadeUpLeaveActive: 'slide-fade-up-leave-active',
    slideFadeUpEnterFrom: 'slide-fade-up-enter-from',
    slideFadeUpLeaveFrom: 'slide-fade-up-leave-from',
    slideFadeUpEnterTo: 'slide-fade-up-enter-to',
    slideFadeUpLeaveTo: 'slide-fade-up-leave-to'
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
    this.cardNumberOutput = document.querySelector(this.selectors.cardNumber);
    this.cardHolderOutput = document.querySelector(this.selectors.cardHolder);
    this.cardExpiryDateOutput = document.querySelector(
      this.selectors.cardExpiryDate
    );
    this.cardCVVOutput = document.querySelector(this.selectors.cardCVV);
    this.cardHighlightElements = {
      cardNumber: this.cardNumberOutput,
      cardHolder: this.cardHolderOutput,
      cardExpiryDate: this.cardExpiryDateOutput
    };
    this.cardNumberItems = this.cardNumberOutput.querySelectorAll('div');
    this.fieldFocused = false;
    this.highlightTimeout = null;
    this.bindEvents();
  }

  updateCardType(type) {
    const masks = type === 'amex' ? CARD_MASKS.amex : CARD_MASKS.default;

    this.cardNumberControl.maxLength = masks.number.length;
    this.cardCVVCodeControl.maxLength = masks.cvv.length;
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
    const validators = this.validationConfig[control.id];
    if (!validators) {
      return true;
    }

    const error = validators.find(
      (validator) => !validator.validate(control.value)
    );

    this.updateError(control, error?.message);

    return !error;
  }

  tabForward(control) {
    if (control.value.length === control.maxLength && control.dataset.next) {
      this.form[control.dataset.next].focus();
    }
  }

  highlight(element) {
    const { offsetWidth, offsetHeight, offsetTop, offsetLeft } = element;

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

  animateCardNumber(cardNumber) {
    const {
      slideFadeUpEnterActive,
      slideFadeUpLeaveActive,
      slideFadeUpEnterFrom,
      slideFadeUpLeaveFrom,
      slideFadeUpEnterTo,
      slideFadeUpLeaveTo
    } = this.stateClasses;

    this.cardNumberItems.forEach((item, index) => {
      const currentChild = item.children[0];
      const currentChar = currentChild.textContent.trim();
      const newChar = cardNumber[index]?.trim() ?? '#';

      if (
        !currentChar ||
        currentChar === newChar ||
        currentChild.classList.contains(slideFadeUpLeaveActive)
      ) {
        return;
      }

      const newChild = document.createElement('span');
      newChild.className = `${slideFadeUpEnterActive} ${slideFadeUpEnterFrom}`;
      newChild.textContent = newChar;

      currentChild.classList.add(slideFadeUpLeaveActive, slideFadeUpLeaveFrom);
      currentChild.after(newChild);

      requestAnimationFrame(() => {
        currentChild.classList.remove(slideFadeUpLeaveFrom);
        currentChild.classList.add(slideFadeUpLeaveTo);

        newChild.classList.remove(slideFadeUpEnterFrom);
        newChild.classList.add(slideFadeUpEnterTo);

        setTimeout(() => {
          currentChild.remove();
          newChild.className = '';
        }, SLIDE_FADE_UP_ANIMATION_MS);
      });
    });
  }

  onCardNumberInput = (event) => {
    const target = event.target;
    const cardNumber = formatCardNumber(target.value);
    target.value = cardNumber;

    this.animateCardNumber(cardNumber);

    this.updateCardType(getCardType(cardNumber));
    this.tabForward(target);
  };

  onCardExpiryDateInput = (event) => {
    const target = event.target;
    target.value = formatExpiryDate(target.value);

    this.tabForward(target);
  };

  onCardCVVCodeInput = (event) => {
    const target = event.target;
    const cvv = formatCVVCode(target.value);
    target.value = cvv;

    this.cardCVVOutput.textContent = '*'.repeat(cvv.length);
  };

  onBlur = (event) => {
    this.fieldFocused = false;

    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
    }

    const target = event.target;
    if (target.required) {
      this.validateControl(target);
    }

    this.card.classList.remove(this.stateClasses.flip);
    this.highlightTimeout = setTimeout(() => {
      if (!this.fieldFocused) {
        this.clearHighlight();
      }
    }, HIGHLIGHT_ANIMATION_MS);
  };

  onFocus = (event) => {
    this.fieldFocused = true;

    const target = event.target;
    const highlightElement = this.cardHighlightElements[target.id];
    if (highlightElement) {
      this.highlight(highlightElement);
    } else {
      this.clearHighlight();
    }

    if (target === this.cardCVVCodeControl) {
      this.card.classList.add(this.stateClasses.flip);
    }
  };

  onSubmit = (event) => {
    const requiredControls = [...this.form.elements].filter(
      (control) => control.required
    );
    const invalidControls = requiredControls.filter(
      (control) => !this.validateControl(control)
    );

    if (invalidControls.length) {
      event.preventDefault();
      invalidControls[0].focus();
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
