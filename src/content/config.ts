import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    lastmod: z.date().optional(),
    heroImage: z.string().optional(),
    imageAlt: z.string().optional(),
    image: z.any().optional(),  // Add this line to support image
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  blog,
};
