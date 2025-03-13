import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: 'https://harryhayman.com',
  integrations: [
    mdx(),
    tailwind({
      // Configure theme customization
      config: { path: './tailwind.config.cjs' },
    })
  ],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      wrap: true
    }
  },
  vite: {
    ssr: {
      external: ["svgo"]
    }
  }
});