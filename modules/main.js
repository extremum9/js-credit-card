import { getRandomInt } from './utils.js';

const TOTAL_IMAGES = 14;

const selectors = {
  card: '.card-js'
};

const randomCardImage = `url(../images/wallpaper-${getRandomInt(
  TOTAL_IMAGES
)}.jpeg)`;

const card = document.querySelector(selectors.card);
card.style.setProperty('--card-background-image', randomCardImage);
