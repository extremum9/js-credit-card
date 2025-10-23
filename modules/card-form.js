import validators from './validators.js';
import {
  formatCardNumber,
  formatCvc,
  formatExpiryDate,
  getCardType
} from './utils.js';

const CARD_MASKS = {
  visa: {
    number: 'XXXX XXXX XXXX XXXX',
    cvc: 'XXX'
  },
  mastercard: {
    number: 'XXXX XXXX XXXX XXXX',
    cvc: 'XXX'
  },
  amex: {
    number: 'XXXX XXXXXX XXXXX',
    cvc: 'XXXX'
  },
  discover: {
    number: 'XXXX XXXX XXXX XXXX',
    cvc: 'XXX'
  },
  unknown: {
    number: 'XXXX XXXX XXXX XXXX',
    cvc: 'XXX'
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
    cardCvcOutput: '.js-card-cvc-output',
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
    cardCvc: [
      validators.required('Enter your CVC'),
      validators.cvc('Incorrect CVC')
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
    this.cardCvcControl = this.form.cardCvc;

    this.card = document.querySelector(this.selectors.card);
    this.cardTypeImageOutput = this.card.querySelector(
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
    this.cardCvcOutput = this.card.querySelector(this.selectors.cardCvcOutput);

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

  updateCardTypeImage(cardType) {
    this.cardTypeImageOutput.src = `images/${cardType}.png`;
    this.cardTypeImageOutput.setAttribute('alt', cardType);
  }

  updateCardNumberMask(cardType) {
    const numberMask = CARD_MASKS[cardType].number;

    this.cardNumberControl.maxLength = numberMask.length;
    this.cardNumberContainer.innerHTML = [...numberMask].reduce(
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

  updateCardCvcMask(cardType) {
    const cvcMask = CARD_MASKS[cardType].cvc;

    this.cardCvcControl.maxLength = cvcMask.length;
    this.cardCvcControl.placeholder = cvcMask;
  }

  updateCardNumber(cardNumber) {
    this.cardNumberItems.forEach((item, index) => {
      const oldChar = item.textContent.trim();
      const newChar = cardNumber[index]?.trim() ?? '#';
      if (oldChar && oldChar !== newChar) {
        item.textContent = newChar;
      }
    });
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
    this.updateCardTypeImage('visa');
    this.updateCardNumberMask('visa');
    this.updateCardCvcMask('visa');
    this.cardHolderOutput.textContent = CARD_HOLDER_PLACEHOLDER;
    this.cardExpiryDateOutput.textContent = CARD_EXPIRY_DATE_PLACEHOLDER;
    this.cardCvcOutput.textContent = '';
  }

  onCardNumberInput = (event) => {
    const target = event.target;
    const cardNumber = formatCardNumber(target.value);
    target.value = cardNumber;

    const cardType = getCardType(cardNumber);
    if (this.currentCardType !== cardType) {
      this.currentCardType = cardType;
      this.updateCardTypeImage(cardType);
      this.updateCardNumberMask(cardType);
      this.updateCardCvcMask(cardType);
    }

    this.updateCardNumber(cardNumber);
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

  onCardCvcInput = (event) => {
    const target = event.target;
    const cvc = formatCvc(target.value);
    target.value = cvc;

    this.cardCvcOutput.textContent = '*'.repeat(cvc.length);
    this.tabForward(target);
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

    if (target === this.cardCvcControl) {
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
    this.cardCvcControl.addEventListener('input', this.onCardCvcInput);
    this.form.addEventListener('blur', this.onBlur, { capture: true });
    this.form.addEventListener('focus', this.onFocus, { capture: true });
    this.form.addEventListener('submit', this.onSubmit);
  }
}

export default CardForm;
