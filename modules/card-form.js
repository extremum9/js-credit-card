import validators from './validators.js'
import {formatCardNumber, formatCVVCode, formatExpiryDate} from './utils.js'

class CardForm {
	selectors = {
		form: '.js-form',
		fieldError: '.js-form-field-error'
	};
	
	validationConfig = {
		email: [validators.required('Enter your email'), validators.email('Incorrect email')],
		cardNumber: [validators.required('Enter your card number'), validators.cardNumber('Incorrect card number')],
		cardHolder: [validators.required('Enter your full name')],
		cardExpiryDate: [validators.required('Enter your expiry date'), validators.expiryDate('Incorrect expiry date')],
		cardCVVCode: [validators.required('Enter your CVV'), validators.cvv('Incorrect CVV')]
	};
	
	constructor() {
		this.form = document.querySelector(this.selectors.form);
		this.cardNumberControl = this.form.cardNumber;
		this.cardExpiryDateControl = this.form.cardExpiryDate;
		this.cardCVVCodeControl = this.form.cardCVVCode;
		this.bindEvents();
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
	
	onCardNumberInput = (event) => {
		const target = event.target;
		target.value = formatCardNumber(target.value);
	};
	
	onCardExpiryDateInput = (event) => {
		const target = event.target;
		target.value = formatExpiryDate(target.value);
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
	};
	
	onSubmit = (event) => {
		event.preventDefault();
	};
	
	bindEvents() {
		this.cardNumberControl.addEventListener('input', this.onCardNumberInput);
		this.cardExpiryDateControl.addEventListener('input', this.onCardExpiryDateInput);
		this.cardCVVCodeControl.addEventListener('input', this.onCardCVVCodeInput);
		this.form.addEventListener('blur', this.onBlur, { capture: true });
		this.form.addEventListener('submit', this.onSubmit);
	}
}

export default CardForm;