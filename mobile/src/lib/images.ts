import type { ImageSource } from 'expo-image';
import { SITE_IMAGES } from './image-map';

/** Image source for a product photo URL from the database (website path or full URL). */
export function imageSource(url: string | null | undefined): ImageSource | number | null {
  if (!url) return null;
  if (SITE_IMAGES[url]) return SITE_IMAGES[url];
  if (/^https?:\/\//.test(url)) return { uri: url };
  return null;
}

export const LOGO = SITE_IMAGES['/images/brand/logo-circle.jpg'];
