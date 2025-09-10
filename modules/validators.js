const EMAIL_REGEXP = /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d-]+\.[a-z]{2,}$/;

const requiredValidator = (value) => value.trim() !== '';

const emailValidator = (email) => EMAIL_REGEXP.test(email);

const cardNumberValidator = (number) => {
	const formatted = number.replace(/\D/g, '');
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
};

const expiryDateValidator = (date) => {
	const formatted = date.split('/').map(Number);
	const month = formatted[0];
	const year = formatted[1];
	
	if (!month || !year || month > 12) {
		return false;
	}
	
	const currentDate = new Date();
	const currentYear = currentDate.getFullYear() % 100;
	const currentMonth = currentDate.getMonth() + 1;
	
	return year > currentYear || (year === currentYear && month >= currentMonth);
};

const CVVCodeValidator = (cvv) => /^\d{3,4}$/.test(cvv);

export const validators = {
	required: (message) => ({
		validate: requiredValidator,
		message
	}),
	email: (message) => ({
		validate: emailValidator,
		message
	}),
	cardNumber: (message) => ({
		validate: cardNumberValidator,
		message
	}),
	expiryDate: (message) => ({
		validate: expiryDateValidator,
		message
	}),
	cvv: (message) => ({
		validate: CVVCodeValidator,
		message
	})
};