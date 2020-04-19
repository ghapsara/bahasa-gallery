import { getPixelRatio } from './utlis';

export const WIDTH = window.innerWidth;
export const HEIGHT = window.innerHeight;

export const SCROLL_HEIGHT = 5 * HEIGHT;
export const SCROLL_TOP = HEIGHT / 6;
export const SCROLL_VIEW_HEIGHT = SCROLL_HEIGHT - HEIGHT;

export const SCROLL_WIDTH = 3 * WIDTH;
export const SCROLL_VIEW_WIDTH = SCROLL_WIDTH - WIDTH;

export const PIXEL_RATIO = getPixelRatio();

export const WIDTH_BY_PIXEL_RATIO = WIDTH * PIXEL_RATIO;
export const HEIGHT_BY_PIXEL_RATIO = HEIGHT * PIXEL_RATIO;

// color scheme https://www.museummacan.org/collections/raden-saleh-araber-zu-pferd
export const COLORS = [
  "#ee1d0e",
  "#e8975a",
  "#decda4",
  "#d34b3a",
  "#a11e0e",
  "#a9c8d2",
  "#8a4a28",
  "#810901",
  "#a76b31",
  "#f87c72", // 2
  "#efa284",
  "#b19464",
  "#98a092",
  "#53616d",
  "#f95850",
  "#e48770",
  "#536e8a",
  "#f43e32",
  "#5d2e22",
  "#a2cde7",
  "#f38e4c",
  "#b7b997",
  "#c2b083",
  "#e3cea5", // 1
  "#6b2e23",
  "#d45f30",
  "#744f45",
  "#62608b", // 1 2
  "#4d4759",
  "#4e638a",
  "#e0ac96",
  "#d75f0b",
  "#787a96",
  "#a2c9dd",
  "#787a96",
];



export const DOPE = [
  "#f95850",
  "#62608b",
  "#efa284",
  "#a2cde7",
  "#decda4"
]

// export const COLOR = "#f95850";
// export const BACKGROUND_COLOR = '#423c4a';
// export const COLOR = "#f87c72";
export const BACKGROUND_COLOR = 'white';
// export const BACKGROUND_COLOR = "#f87c72";
export const COLOR = "black";
