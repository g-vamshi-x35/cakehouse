import type { ImageSource } from 'expo-image';
import { SITE_IMAGES } from './image-map';

export const WEBSITE_URL = 'https://www.cakehousekmp.in';

/**
 * Image source for a photo URL stored in the database. Website paths
 * ("/images/…") are served from the app bundle when synced (instant, offline),
 * otherwise loaded from the live website, so new photos the owner adds on the
 * website show up in the app too. Full URLs (Supabase Storage) load directly.
 */
export function imageSource(url: string | null | undefined): ImageSource | number | null {
  if (!url) return null;
  if (SITE_IMAGES[url]) return SITE_IMAGES[url];
  if (/^https?:\/\//.test(url)) return { uri: url };
  if (url.startsWith('/')) return { uri: `${WEBSITE_URL}${url}` };
  return null;
}

export const LOGO = SITE_IMAGES['/images/brand/logo-circle.jpg'];
export const LOGO_VERTICAL = SITE_IMAGES['/images/brand/logo-vertical.jpg'];
export const HERO = SITE_IMAGES['/images/hero/hero-spiderman-cake.jpg'];
export const GALLERY = Array.from({ length: 12 }, (_, i) => SITE_IMAGES[`/images/gallery/gallery-${String(i + 1).padStart(2, '0')}.jpg`]).filter(
  Boolean
);
export const MENU_IMAGES = {
  bento: SITE_IMAGES['/images/menu/menu-bento-cake.jpg'],
  car: SITE_IMAGES['/images/menu/menu-car-cake.jpg'],
  doll: SITE_IMAGES['/images/menu/menu-doll-barbie-cake.jpg'],
  doraemon: SITE_IMAGES['/images/menu/menu-doraemon-cake.jpg'],
  fruit: SITE_IMAGES['/images/menu/menu-fruit-cake.jpg'],
};

export function placeholderEmoji(categorySlug: string) {
  return categorySlug === 'pizza' ? '🍕' : categorySlug === 'snacks' ? '🥟' : '🎂';
}
