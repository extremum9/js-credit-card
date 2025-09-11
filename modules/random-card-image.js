import {getRandomInt} from './utils.js'

const TOTAL_IMAGES = 14;

const generateRandomCardImage = () => {
	const randomImage = `url(../images/wallpaper-${getRandomInt(TOTAL_IMAGES)}.jpeg)`;
	const card = document.querySelector('.js-card');
	card.style.setProperty('--card-background-image', randomImage);
};

export default generateRandomCardImage;