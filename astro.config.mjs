import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

/*
 * The Keystatic admin route emits its own Tailwind bundle
 * (_astro/keystatic-astro-page.*.css, ~48 KB). Astro links it from every
 * prerendered page even though it contains none of the site's own styles:
 * the real site stylesheet is a separate bundle that already carries
 * preflight, the design tokens and every component rule.
 *
 * Leaving it in place costs a render-blocking stylesheet on every page load.
 * This integration removes the link from generated HTML outside /keystatic,
 * where the admin UI still needs it. If the filename pattern ever stops
 * matching, the pass is a no-op and nothing breaks.
 */
function dropKeystaticCssFromPublicPages() {
  const linkPattern =
    /<link\s+rel="stylesheet"\s+href="\/_astro\/keystatic-astro-page\.[^"]+\.css"\s*\/?>/g;

  return {
    name: 'drop-keystatic-css-from-public-pages',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const root = new URL(dir).pathname.replace(/^\/([A-Za-z]:)/, '$1');
        let touched = 0;

        const walk = (current) => {
          for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) {
              if (entry.name === 'keystatic') continue;
              walk(full);
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
              const html = fs.readFileSync(full, 'utf8');
              if (!linkPattern.test(html)) {
                linkPattern.lastIndex = 0;
                continue;
              }
              linkPattern.lastIndex = 0;
              fs.writeFileSync(full, html.replace(linkPattern, ''), 'utf8');
              touched += 1;
            }
          }
        };

        try {
          walk(root);
          logger.info(
            `Removed the Keystatic admin stylesheet from ${touched} public pages`,
          );
        } catch (error) {
          logger.warn(`Skipped Keystatic stylesheet cleanup: ${error.message}`);
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
    dropKeystaticCssFromPublicPages()
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