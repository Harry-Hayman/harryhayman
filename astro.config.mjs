import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

/*
 * One pass over every prerendered page once the build is done. Each step is
 * a plain string rewrite; if a pattern ever stops matching, that step becomes
 * a no-op and the page ships exactly as Astro built it.
 *
 * 1. Drop the Keystatic stylesheet. The Keystatic admin route emits its own
 *    Tailwind bundle (_astro/keystatic-astro-page.*.css, ~48 KB). Astro links
 *    it from every prerendered page even though it contains none of the
 *    site's own styles: the real site stylesheet is a separate bundle that
 *    already carries preflight, the design tokens and every component rule.
 *    The admin UI under /keystatic is never touched.
 *
 * 2. Inline the site's own stylesheets. Two linked files (the shared bundle
 *    and the page's own) were the only render-blocking requests left, and the
 *    fonts could not start downloading until both had arrived. Inlined, the
 *    first paint needs the HTML alone. Most visits arrive on a single page
 *    from a social link, so a per-page copy costs less than the extra round
 *    trip. Anything unexpectedly large stays linked.
 *
 * 3. Opt every script out of Cloudflare Rocket Loader. The zone has it on,
 *    and it rewrites each <script> to run only after the page has loaded.
 *    That delays the theme script that has to run before first paint (a
 *    dark-mode visitor saw a flash of the light theme) and buys nothing:
 *    Astro already ships its scripts deferred. data-cfasync="false" is
 *    Cloudflare's documented way to leave a script alone.
 *
 * 4. Link to the canonical form. Netlify serves every page at a lowercase
 *    path with a trailing slash and 301s anything else, so 80% of internal
 *    links cost a redirect hop. Templates build links through
 *    src/lib/paths.ts; this catches the ones written by hand inside posts.
 *
 * 5. Size the photos inside posts. Images written into posts as plain
 *    markdown reached the page with no width, so Netlify served the camera
 *    original (4,000+ px, often several MB) into a column under 800 px wide.
 *    Each now gets a capped width and a srcset. The width and height
 *    attributes, and so the layout, are unchanged.
 *
 * 6. Strip utm_source=chatgpt.com from outbound links. It labels Harry's
 *    citations as AI-assisted research and passes that tag to every
 *    publisher he links to.
 *
 * 7. Remove the empty <h1> a few posts carry (a stray "#" line in the
 *    markdown), so every page has exactly one h1.
 */
function postProcessHtml() {
  const keystaticLink =
    /<link\s+rel="stylesheet"\s+href="\/_astro\/keystatic-astro-page\.[^"]+\.css"\s*\/?>/g;
  const siteLink = /<link\s+rel="stylesheet"\s+href="(\/_astro\/[^"]+\.css)"\s*\/?>/g;
  const scriptOpen = /<script(?=[\s>])(?![^>]*\bdata-cfasync=)/g;
  const MAX_INLINE_BYTES = 120 * 1024;
  const internalHref = /(\s)href="(\/[^"#?]*)((?:[?#][^"]*)?)"/g;
  const notAPage =
    /^\/(?:_astro|\.netlify|cdn-cgi|keystatic|api)(?:\/|$)|^\/\/|\.[a-z0-9]{2,5}$/i;
  const anyImg = /<img\b[^>]*>/g;
  const hasParam = (url, name) =>
    new RegExp(`(?:\\?|&|&#38;|&amp;)${name}=`).test(url);
  const PHOTO_WIDTHS = [480, 768, 1080, 1536];
  const chatgptHref = /(\shref=")([^"]*utm_source=chatgpt\.com[^"]*)"/g;
  const emptyH1 = /<h1\b[^>]*>\s*<\/h1>/g;

  return {
    name: 'post-process-html',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const cssCache = new Map();
        const stats = {
          pages: 0,
          keystatic: 0,
          inlined: 0,
          scripts: 0,
          links: 0,
          photos: 0,
          trackers: 0,
          emptyH1: 0,
        };

        const readCss = (href) => {
          if (!cssCache.has(href)) {
            const file = path.join(root, href.replace(/^\//, ''));
            cssCache.set(href, fs.readFileSync(file, 'utf8'));
          }
          return cssCache.get(href);
        };

        const rewrite = (html) => {
          let out = html.replace(keystaticLink, () => {
            stats.keystatic += 1;
            return '';
          });
          out = out.replace(siteLink, (tag, href) => {
            try {
              const css = readCss(href);
              if (css.length > MAX_INLINE_BYTES || css.includes('</style')) {
                return tag;
              }
              stats.inlined += 1;
              return `<style>${css}</style>`;
            } catch {
              return tag;
            }
          });
          out = out.replace(scriptOpen, () => {
            stats.scripts += 1;
            return '<script data-cfasync="false"';
          });
          out = out.replace(internalHref, (tag, space, p, rest) => {
            if (p === '/' || notAPage.test(p)) return tag;
            let next = /^\/blog\/category\//i.test(p) ? p.toLowerCase() : p;
            if (!next.endsWith('/')) next += '/';
            if (next === p) return tag;
            stats.links += 1;
            return `${space}href="${next}${rest}"`;
          });
          out = out.replace(anyImg, (tag) => {
            const src = tag.match(/\ssrc="(\/\.netlify\/images\?url=[^"]+)"/);
            if (!src || /\ssrcset=/.test(tag) || hasParam(src[1], 'w')) return tag;
            const natural = Number((tag.match(/\swidth="(\d+)"/) || [])[1]);
            if (!natural || natural <= 900) return tag;
            const amp = '&#38;';
            const format = hasParam(src[1], 'fm') ? '' : `${amp}fm=webp`;
            const at = (w) => `${src[1]}${format}${amp}w=${w}${amp}q=70`;
            const widths = PHOTO_WIDTHS.filter((w) => w < natural);
            stats.photos += 1;
            return tag.replace(
              src[0],
              ` src="${at(Math.min(1080, natural))}"` +
                ` srcset="${widths.map((w) => `${at(w)} ${w}w`).join(', ')}"` +
                ' sizes="(min-width: 1024px) 768px, calc(100vw - 2.5rem)"',
            );
          });
          out = out.replace(chatgptHref, (tag, start, url) => {
            const [base, ...hash] = url.split('#');
            const q = base.indexOf('?');
            if (q === -1) return tag;
            const params = base
              .slice(q + 1)
              .split(/&#38;|&amp;|&/)
              .filter((kv) => kv && kv !== 'utm_source=chatgpt.com');
            stats.trackers += 1;
            const clean =
              base.slice(0, q) +
              (params.length ? `?${params.join('&amp;')}` : '') +
              (hash.length ? `#${hash.join('#')}` : '');
            return `${start}${clean}"`;
          });
          out = out.replace(emptyH1, () => {
            stats.emptyH1 += 1;
            return '';
          });
          return out;
        };

        const walk = (current) => {
          for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) {
              if (entry.name === 'keystatic') continue;
              walk(full);
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
              const html = fs.readFileSync(full, 'utf8');
              const next = rewrite(html);
              stats.pages += 1;
              if (next !== html) fs.writeFileSync(full, next, 'utf8');
            }
          }
        };

        try {
          walk(root);
          logger.info(
            `HTML post-process: ${stats.pages} pages, ${stats.keystatic} Keystatic links dropped, ` +
              `${stats.inlined} stylesheets inlined, ${stats.scripts} scripts opted out of Rocket Loader, ` +
              `${stats.links} links made canonical, ${stats.photos} post photos sized, ` +
              `${stats.trackers} tracking tags stripped, ${stats.emptyH1} empty h1 removed`,
          );
        } catch (error) {
          logger.warn(`Skipped HTML post-process: ${error.message}`);
        }
      },
    },
  };
}

/*
 * Post dates and category sizes, read straight from the content files so the
 * sitemap can carry them. A file that cannot be parsed simply goes without.
 */
const THIN_ARCHIVE = 3; // keep in step with src/pages/blog/category/[category].astro

function readBlogIndex() {
  const dir = new URL('./src/content/blog/', import.meta.url);
  const lastmod = new Map(); // post slug -> ISO date of the latest edit
  const categories = new Map(); // lowercase category -> number of posts
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((file) => /\.mdx?$/.test(file));
  } catch {
    return { lastmod, categories };
  }
  for (const file of files) {
    let text;
    try {
      text = fs.readFileSync(new URL(file, dir), 'utf8');
    } catch {
      continue;
    }
    const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!front) continue;
    const field = (name) => {
      const line = front[1]
        .split(/\r?\n/)
        .find((row) => row.startsWith(`${name}:`));
      if (!line) return undefined;
      const value = line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '');
      return value || undefined;
    };
    if (field('draft') === 'true') continue;
    const slug = field('slug') || file.replace(/\.mdx?$/, '');
    const times = ['pubDate', 'updatedDate', 'lastmod']
      .map((name) => Date.parse(field(name) || ''))
      .filter((time) => !Number.isNaN(time));
    if (times.length) lastmod.set(slug, new Date(Math.max(...times)).toISOString());
    const category = field('category');
    if (category) {
      const key = category.toLowerCase();
      categories.set(key, (categories.get(key) || 0) + 1);
    }
  }
  return { lastmod, categories };
}

const blogIndex = readBlogIndex();

/*
 * Known follow-up, deliberately not patched here.
 * Images written into posts as plain markdown (`![](...)`) are emitted at their
 * natural size: several are 4000+ px wide and over 1 MB (worst case 5.7 MB) for
 * a column that is never wider than ~700 px. Astro resolves those images before
 * user rehype plugins run, so a plugin cannot inject a smaller width; fixing it
 * properly means either downsizing the source files under src/assets/blogs or
 * converting the markdown image syntax to <Image /> in the MDX.
 */
// https://astro.build/config
export default defineConfig({
  site: 'https://harryhayman.com',
  output: 'hybrid',
  adapter: netlify({
    imageCDN: true
  }),
  integrations: [
    mdx({
      optimize: true,
      remarkPlugins: [],
      rehypePlugins: []
    }),
    tailwind({
      // Configure theme customization
      config: { path: './tailwind.config.cjs' },
    }),
    sitemap({
      /* The sitemap lists what should be indexed: no error page, and no
         archive thin enough to carry noindex. */
      filter: (page) => {
        const pathname = decodeURIComponent(new URL(page).pathname);
        if (pathname === '/404/' || pathname.startsWith('/keystatic')) return false;
        const archive = pathname.match(/^\/blog\/category\/([^/]+)\/$/);
        if (archive) {
          return (blogIndex.categories.get(archive[1].toLowerCase()) || 0) >= THIN_ARCHIVE;
        }
        return true;
      },
      /* A real last-edited date on every post, so crawlers can tell which
         pages changed. */
      serialize: (item) => {
        const post = new URL(item.url).pathname.match(/^\/blog\/([^/]+)\/$/);
        const lastmod = post && blogIndex.lastmod.get(post[1]);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
    react(),
    keystatic(),
    postProcessHtml()
  ],
  image: {
    // Optimize and compress all images during build
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      }
    },
    remotePatterns: [{ protocol: "https" }],
    domains: ['harryhayman.com'],
    // WebP format for optimal compression
    formats: ['webp'],
    // Aggressive compression: 60% quality for minimal size
    quality: 60
  },
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      wrap: true
    }
  },
  vite: {
    ssr: {
      external: ["svgo"]
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname
      }
    },
    build: {
      cssMinify: true
      // manualChunks removed: forcing react/gsap into shared chunks made
      // Vite associate the Keystatic admin CSS with every public page.
    }
  }
});