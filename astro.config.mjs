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
 */
function postProcessHtml() {
  const keystaticLink =
    /<link\s+rel="stylesheet"\s+href="\/_astro\/keystatic-astro-page\.[^"]+\.css"\s*\/?>/g;
  const siteLink = /<link\s+rel="stylesheet"\s+href="(\/_astro\/[^"]+\.css)"\s*\/?>/g;
  const scriptOpen = /<script(?=[\s>])(?![^>]*\bdata-cfasync=)/g;
  const MAX_INLINE_BYTES = 120 * 1024;

  return {
    name: 'post-process-html',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const cssCache = new Map();
        const stats = { pages: 0, keystatic: 0, inlined: 0, scripts: 0 };

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
              `${stats.inlined} stylesheets inlined, ${stats.scripts} scripts opted out of Rocket Loader`,
          );
        } catch (error) {
          logger.warn(`Skipped HTML post-process: ${error.message}`);
        }
      },
    },
  };
}

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
    sitemap(),
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