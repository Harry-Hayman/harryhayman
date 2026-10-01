/*
 * The one URL form this site serves without a redirect.
 *
 * Netlify answers every page at a lowercase path with a trailing slash and
 * 301s every other spelling to it (`/about` to `/about/`, `/blog/category/Jazz`
 * to `/blog/category/jazz/`). Linking straight to that form saves a redirect
 * hop on every internal link and keeps canonicals, the sitemap and the links
 * in agreement. Build every internal URL through these helpers.
 */

export const SITE = "https://harryhayman.com";

/** `/blog/<slug>/` */
export const postPath = (slug: string) => `/blog/${slug}/`;

/** The archive path segment for a category: its name, lowercased. */
export const categorySlug = (category: string) => category.trim().toLowerCase();

/** `/blog/category/<name lowercased>/` */
export const categoryPath = (category: string) =>
  `/blog/category/${categorySlug(category)}/`;

/** Absolute, percent-encoded URL for a site path, for markup and feeds. */
export const absolute = (path: string) => new URL(encodeURI(path), SITE).href;
