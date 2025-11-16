import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

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
    keystatic()
  ],
  image: {
    // Optimize images with proper defaults - maximum compression
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    remotePatterns: [{ protocol: "https" }],
    domains: ['harryhayman.com'],
    formats: ['avif', 'webp'],
    // Aggressive quality for maximum compression
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
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'gsap': ['gsap']
          }
        }
      }
    }
  }
});