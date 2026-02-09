import { defineCollection, z } from "astro:content";

/**
 * Content Collections configuration
 *
 * Defines schemas for content collections (posts, experiences, projects, etc.).
 * Schemas mirror existing frontmatter found found in the content directory.
 */

const baseSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  date: z.union([z.string(), z.coerce.date()]).optional(),
  draft: z.boolean().optional(),
});

const posts = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    hero: z.string().optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .optional(),
  }),
});

const experiences = defineCollection({
  type: "content",
  schema: ({ image }) =>
    baseSchema.extend({
      company: z
        .object({
          name: z.string().optional(),
          image: image().optional(),
          imagealt: z.string().optional(),
        })
        .optional(),
      logistics: z
        .object({
          role: z.string().optional(),
          duration: z.string().optional(),
          startDate: z.union([z.string(), z.coerce.date()]).optional(),
          endDate: z.union([z.string(), z.coerce.date()]).optional(),
        })
        .optional(),
      technologies: z
        .object({
          tools: z.string().optional(),
          skills: z.string().optional(),
        })
        .optional(),
      work: z
        .object({
          responsibilities: z
            .array(z.object({ duties: z.string().optional() }))
            .optional(),
          achievements: z
            .array(z.object({ points: z.string().optional() }))
            .optional(),
        })
        .optional(),
      showcase: z
        .object({
          link: z.string().optional(),
          description: z.string().optional(),
        })
        .optional(),
      // Flattened fields for easier card access
      startDate: z.union([z.string(), z.coerce.date()]).optional(),
      endDate: z.union([z.string(), z.coerce.date()]).optional(),
      thumbnail: image().optional(),
      summary: z.string().optional(),
    }),
});

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    baseSchema.extend({
      summary: z.string().optional(),
      description: z.string().optional(), // from projectcards
      role: z.string().optional(),
      technologies: z.array(z.string()).optional(),
      tools: z.array(z.string()).optional(),
      cover: image().optional(),
      thumbnail: image().optional(), // from projectcards
      final: image().optional(),
      startDate: z.union([z.string(), z.coerce.date()]).optional(), // from projectcards
      endDate: z.union([z.string(), z.coerce.date()]).optional(), // from projectcards
      programming_languages: z.array(z.string()).optional(), // from projectcards
      domains: z.array(z.string()).optional(), // from projectcards
      background: z.string().optional(),
      solution: z.string().optional(),
      process: z.string().optional(),
      impact: z.string().optional(),
      reflection: z.string().optional(),
      links: z
        .object({
          live: z.string().optional(),
          source: z.string().optional(),
        })
        .optional(),
    }),
});

export const collections = {
  posts,
  experiences,
  projects,
};

import type { CollectionEntry } from "astro:content";

export type ExperienceEntry = CollectionEntry<"experiences">["data"];
export type ProjectEntry = CollectionEntry<"projects">["data"];
export type PostEntry = CollectionEntry<"posts">["data"];
