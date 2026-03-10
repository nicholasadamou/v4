/**
 * Unsplash utilities for Open Graph route
 */

import fs from "fs";
import path from "path";
import { extractPhotoId } from "@/lib/image/unsplash";

interface UnsplashImageEntry {
  local_path?: string;
  image_url?: string;
  author?: string;
  author_url?: string;
  skipped?: boolean;
  [key: string]: unknown;
}

interface UnsplashManifest {
  [key: string]: unknown;
  images: Record<string, UnsplashImageEntry>;
}

/**
 * Checks if a URL is an Unsplash photo URL
 */
export const isUnsplashPhotoUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "unsplash.com" &&
      urlObj.pathname.startsWith("/photos/")
    );
  } catch {
    return false;
  }
};

export { extractPhotoId as extractUnsplashPhotoId };

/**
 * Loads and parses the Unsplash manifest file.
 */
export function loadUnsplashManifest(): UnsplashManifest | null {
  try {
    const manifestPath = path.join(
      process.cwd(),
      "public",
      "images",
      "unsplash",
      "manifest.json"
    );
    const content = fs.readFileSync(manifestPath, "utf-8");
    return JSON.parse(content) as UnsplashManifest;
  } catch {
    return null;
  }
}

/**
 * Normalizes a manifest local_path to a public-relative path.
 */
function normalizeLocalPath(localPath: string): string {
  const idx = localPath.indexOf("/images/unsplash/");
  if (idx !== -1) {
    return localPath.slice(idx);
  }
  return localPath;
}

/**
 * Resolves an Unsplash photo URL to a usable image URL.
 * Checks skipped status, normalizes paths, and falls back to image_url.
 */
export const resolveUnsplashImage = (url: string): string | null => {
  const photoId = extractPhotoId(url);
  if (!photoId) return null;

  const manifest = loadUnsplashManifest();
  if (!manifest) return null;

  const entry = manifest.images[photoId];
  if (!entry) return null;
  if (entry.skipped) return null;

  if (entry.local_path) {
    return normalizeLocalPath(entry.local_path);
  }

  return entry.image_url ?? null;
};

/**
 * Returns manifest metadata for an Unsplash photo by ID.
 */
export function getUnsplashImageMetadata(
  photoId: string
): UnsplashImageEntry | null {
  const manifest = loadUnsplashManifest();
  if (!manifest) return null;
  return manifest.images[photoId] ?? null;
}
