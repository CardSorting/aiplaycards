import { AbilitySymbol, NameSymbol } from '@cardEditor/cardStyles';
import { getAssetUrl } from './config/cdn';

const assets = '/assets';
const icons = `${assets}/icons`;
const symbols = `${assets}/symbols`;

// Helper function to create URL-friendly usernames
const urlFriendlyUsername = (username: string): string => {
  return username
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9\-_.]/g, '') // Remove special characters except hyphens, underscores, and dots
    .toLowerCase(); // Convert to lowercase for consistency
};

// Helper function to create URL-friendly slugs (for categories, etc.)
const urlFriendlySlug = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/gi, '-') // Replace special characters with hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase(); // Convert to lowercase for consistency
};

const Routes = {
  Home: '/',
  Create: '/create',
  Creator: '/creator',
  Booster: '/booster',
  BoosterPacks: '/',
  Gallery: '/gallery',
  Community: '/community',
  Profile: (username: string) => `/u/${urlFriendlyUsername(username)}`,
  SpecialPacks: '/special-packs',
  SpecialPackCategory: (categoryName: string) =>
    `/special-packs/${urlFriendlySlug(categoryName)}`,
  Notifications: '/notifications',
  // NextAuth routes
  Login: '/signin',
  PrivacyPolicy: '/privacy',
  TermsOfService: '/terms',
  CookiePolicy: '/cookie-policy',
  GitHub: {
    Home: '',
    Discussions: {
      Home: '',
      Ideas: '',
    },
  },
  Assets: {
    Cards: getAssetUrl(`${assets}/cards`),
    CardsPath: (path: string) => getAssetUrl(`${assets}/cards/${path}`),
    Icons: {
      Set: (slug: string) => getAssetUrl(`${icons}/sets/${slug}.png`),
      Rotation: (slug: string) => getAssetUrl(`${icons}/rotations/${slug}.png`),
      Rarity: (slug: string) => getAssetUrl(`${icons}/rarities/${slug}.png`),
      RarityWhite: (slug: string) =>
        getAssetUrl(`${icons}/rarities/white/${slug}.png`),
      Type: (slug: string) => getAssetUrl(`${icons}/types/${slug}.png`),
      TypeBorder: (slug: string) =>
        getAssetUrl(`${icons}/types/border/${slug}.png`),
    },
    Symbols: {
      Name: (slug: NameSymbol) => getAssetUrl(`${symbols}/name/${slug}.png`),
      Ability: (slug: AbilitySymbol) =>
        getAssetUrl(`${symbols}/ability/${slug}.png`),
    },
  },
};

export default Routes;
export { urlFriendlySlug, urlFriendlyUsername };
