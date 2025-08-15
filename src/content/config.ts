import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  schema: ({ image }) => z.object({
    postSlug: z.string().optional(), // For Keystatic slug field
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    lastmod: z.date().optional(),
    // Legacy fields (for existing posts)
    heroImage: z.string().optional(),
    imageAlt: z.string().optional(),
    // New standard fields (for Keystatic posts)
    image: image().optional(),  // Use Astro's image() helper for proper local image imports
    heroAlt: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  blog,
};
