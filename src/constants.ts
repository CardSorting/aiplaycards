export const cardImgWidth = 747;
export const cardImgHeight = 1038;
export const cardImgAspect = cardImgHeight / cardImgWidth;
export const baseFontSize = 16;
export const cardId = 'card';
// Form width minus all paddings
export const cropperWidth = 354;
export const cropperHeight = (cropperWidth / cardImgWidth) * cardImgHeight;
// 20 megabytes - increased for background images
export const maxFileSize = 20_971_520;

export const siteDescription =
  'PlayMoreTCG.com lets you create your own custom Pokémon cards in the modern Sword and Shield format, including Pokémon-V, V-Max and Full Art Trainers!';

// User and Credits Configuration
export const WELCOME_CREDITS = parseInt(
  process.env.WELCOME_CREDITS || '100',
  10,
);
export const BOOSTER_COST_CREDITS = 25;
export const AI_GENERATION_COST_CREDITS = 25;
