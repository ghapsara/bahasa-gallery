import { getPixelRatio } from './utlis';

export const WIDTH = window.innerHeight;
export const HEIGHT = window.innerHeight;

export const BACKGROUND_COLOR = '#423c4a';
export const COLOR = '#FE9B96';

export const SCROLL_HEIGHT = 5 * HEIGHT;
export const SCROLL_VIEW_HEIGHT = SCROLL_HEIGHT - HEIGHT;

export const PIXEL_RATIO = getPixelRatio();

export const WIDTH_BY_PIXEL_RATIO = WIDTH * PIXEL_RATIO;
export const HEIGHT_BY_PIXEL_RATIO = HEIGHT * PIXEL_RATIO;