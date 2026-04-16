import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Content Collections configuration for Astro 6+
 *
 * This file defines the schemas and loaders for all content collections
 * (posts, experiences, projects). These schemas are used for build-time validation
 * and provide full type safety across the application.
 */

/**
 * Common fields shared across multiple collections.
 */
const baseSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  date: z.union([z.string(), z.coerce.date()]).optional(),
  draft: z.boolean().optional(),
});

/**
 * Blog posts collection.
 * Includes optional hero image and external links.
 */
const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    baseSchema.extend({
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      hero: image().optional(),
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

/**
 * Professional experiences collection.
 * Detailed history including company branding, logistics, and work details.
 */
const experiences = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/experiences",
  }),
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
          focusArea: z.string().optional(),
          status: z.string().optional(),
          department: z.string().optional(),
          type: z.string().optional(),
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
          insight: z.string().optional(),
        })
        .optional(),
      startDate: z.union([z.string(), z.coerce.date()]).optional(),
      endDate: z.union([z.string(), z.coerce.date()]).optional(),
      thumbnail: image().optional(),
      summary: z.string().optional(),
    }),
});

/**
 * Project case studies collection.
 * Comprehensive project details with tech stack, impact, and final results.
 */
const projects = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/projects",
  }),
  schema: ({ image }) =>
    baseSchema.extend({
      summary: z.string().optional(),
      description: z.string().optional(),
      role: z.string().optional(),
      technologies: z.array(z.string()).optional(),
      tools: z.array(z.string()).optional(),
      cover: image().optional(),
      thumbnail: image().optional(),
      final: image().optional(),
      startDate: z.union([z.string(), z.coerce.date()]).optional(),
      endDate: z.union([z.string(), z.coerce.date()]).optional(),
      programming_languages: z.array(z.string()).optional(),
      domains: z.array(z.string()).optional(),
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
