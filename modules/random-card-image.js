import {getRandomInt} from './utils.js'
import {SELECTORS} from './selectors.js'

const TOTAL_IMAGES = 14;

export const generateRandomCardImage = () => {
	const randomImage = `url(../images/wallpaper-${getRandomInt(TOTAL_IMAGES)}.jpeg)`;
	const card = document.querySelector(SELECTORS.card);
	card.style.setProperty('--card-background-image', randomImage);
};