import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    lastmod: z.date().optional(),
    heroImage: z.string().optional(),
    imageAlt: z.string().optional(),
    heroAlt: z.string().optional(),
    image: image().optional(),  // Use Astro's image() helper for proper local image imports
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  blog,
};
