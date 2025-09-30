import validators from './validators.js';
import {
  formatCardNumber,
  formatCVVCode,
  formatExpiryDate,
  getCardType
} from './utils.js';

const CARD_MASKS = {
  visa: {
    number: 'XXXX XXXX XXXX XXXX',
    cvv: 'XXX'
  },
  mastercard: {
    number: 'XXXX XXXX XXXX XXXX',
    cvv: 'XXX'
  },
  amex: {
    number: 'XXXX XXXXXX XXXXX',
    cvv: 'XXXX'
  },
  discover: {
    number: 'XXXX XXXX XXXX XXXX',
    cvv: 'XXX'
  },
  unknown: {
    number: 'XXXXXXXXXXXXXXXX',
    cvv: 'XXX'
  }
};

const CARD_HOLDER_PLACEHOLDER = 'Full Name';
const CARD_EXPIRY_DATE_PLACEHOLDER = 'MM/YY';

const HIGHLIGHT_ANIMATION_MS = 300;

class CardForm {
  selectors = {
    form: '.js-form',
    fieldError: '.js-form-field-error',
    card: '.js-card',
    cardTypeImageOutput: '.js-card-type-image-output',
    cardNumberContainer: '.js-card-number-container',
    cardNumberItem: '.js-card-number-item',
    cardHolderContainer: '.js-card-holder-container',
    cardHolderOutput: '.js-card-holder-output',
    cardExpiryDateContainer: '.js-card-expiry-date-container',
    cardExpiryDateOutput: '.js-card-expiry-date-output',
    cardCVVOutput: '.js-card-cvv-output',
    cardHighlighter: '.js-card-highlighter'
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
    this.cardTypeImageOutputs = this.card.querySelectorAll(
      this.selectors.cardTypeImageOutput
    );
    this.cardNumberContainer = this.card.querySelector(
      this.selectors.cardNumberContainer
    );
    this.cardNumberItems = this.cardNumberContainer.querySelectorAll(
      this.selectors.cardNumberItem
    );
    this.cardHolderContainer = this.card.querySelector(
      this.selectors.cardHolderContainer
    );
    this.cardHolderOutput = this.cardHolderContainer.querySelector(
      this.selectors.cardHolderOutput
    );
    this.cardExpiryDateContainer = this.card.querySelector(
      this.selectors.cardExpiryDateContainer
    );
    this.cardExpiryDateOutput = this.cardExpiryDateContainer.querySelector(
      this.selectors.cardExpiryDateOutput
    );
    this.cardCVVOutput = this.card.querySelector(this.selectors.cardCVVOutput);

    this.cardHighlighter = this.card.querySelector(
      this.selectors.cardHighlighter
    );
    this.cardHighlightElements = {
      cardNumber: this.cardNumberContainer,
      cardHolder: this.cardHolderContainer,
      cardExpiryDate: this.cardExpiryDateContainer
    };

    this.fieldFocused = false;
    this.highlightTimeout = null;
    this.currentCardType = 'visa';
    this.bindEvents();
  }

  updateCardType(cardType) {
    this.currentCardType = cardType;

    const { number: numberMask, cvv: cvvMask } = CARD_MASKS[cardType];

    this.cardNumberControl.maxLength = numberMask.length;
    this.cardCVVCodeControl.maxLength = cvvMask.length;
    this.cardCVVCodeControl.placeholder = cvvMask;

    this.cardTypeImageOutputs.forEach((cardTypeImage) => {
      cardTypeImage.src = `images/${cardType}.png`;
      cardTypeImage.setAttribute(
        'alt',
        cardType === 'unknown' ? 'unknown card network' : cardType
      );
    });

    this.cardNumberContainer.innerHTML = Array.prototype.reduce.call(
      numberMask,
      (template, char) => {
        if (char === ' ') {
          template += `<div class="card-number-item card-number-item-blank js-card-number-item"></div>`;
        } else {
          template += `<div class="card-number-item js-card-number-item">#</div>`;
        }
        return template;
      },
      ''
    );

    this.cardNumberItems = this.cardNumberContainer.querySelectorAll(
      this.selectors.cardNumberItem
    );
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

  clearCard() {
    this.updateCardType('visa');
    this.cardHolderOutput.textContent = CARD_HOLDER_PLACEHOLDER;
    this.cardExpiryDateOutput.textContent = CARD_EXPIRY_DATE_PLACEHOLDER;
    this.cardCVVOutput.textContent = '';
  }

  onCardNumberInput = (event) => {
    const target = event.target;
    const cardNumber = formatCardNumber(target.value);
    target.value = cardNumber;

    const cardType = getCardType(cardNumber);
    if (this.currentCardType !== cardType && cardNumber.length) {
      this.updateCardType(cardType);
    }

    this.cardNumberItems.forEach((item, index) => {
      const oldChar = item.textContent.trim();
      const newChar = cardNumber[index]?.trim() ?? '#';
      if (oldChar && oldChar !== newChar) {
        item.textContent = newChar;
      }
    });

    this.tabForward(target);
  };

  onCardHolderInput = (event) => {
    const target = event.target;
    const cardHolder = target.value;

    this.cardHolderOutput.textContent = cardHolder.length
      ? cardHolder
      : CARD_HOLDER_PLACEHOLDER;

    this.tabForward(target);
  };

  onCardExpiryDateInput = (event) => {
    const target = event.target;
    const expiryDate = formatExpiryDate(target.value);
    target.value = expiryDate;

    this.cardExpiryDateOutput.textContent = expiryDate.length
      ? expiryDate
      : CARD_EXPIRY_DATE_PLACEHOLDER;

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
    event.preventDefault();

    const requiredControls = [...this.form.elements].filter(
      (control) => control.required
    );
    const invalidControls = requiredControls.filter(
      (control) => !this.validateControl(control)
    );

    if (invalidControls.length) {
      invalidControls[0].focus();
    } else {
      this.form.reset();
      this.clearCard();
    }
  };

  bindEvents() {
    this.cardNumberControl.addEventListener('input', this.onCardNumberInput);
    this.cardHolderControl.addEventListener('input', this.onCardHolderInput);
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
