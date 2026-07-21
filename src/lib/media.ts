import "server-only";
import { existsSync } from "fs";
import path from "path";

/**
 * Returns the hero background video's public path if one has been dropped
 * into public/video/hero.mp4, otherwise undefined (Hero then falls back
 * to the static image background). Drop in a real video — no code change
 * needed to activate it.
 */
export function getHeroVideoSrc(): string | undefined {
  const filePath = path.join(process.cwd(), "public", "video", "hero.mp4");
  return existsSync(filePath) ? "/video/hero.mp4" : undefined;
}
