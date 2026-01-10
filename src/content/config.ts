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

const baseCardSchema = baseSchema.extend({
  summary: z.string().optional(),
  startDate: z.union([z.string(), z.coerce.date()]).optional(),
  endDate: z.union([z.string(), z.coerce.date()]).optional(),
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
      card: z
        .object({
          date: z.union([z.string(), z.coerce.date()]).optional(),
          thumbnail: z.string().optional(),
          summary: z.string().optional(),
        })
        .optional(),
    }),
});

const experiencecards = defineCollection({
  type: "content",
  schema: ({ image }) =>
    baseCardSchema.extend({
      company: z.string().optional(),
      thumbnail: image().optional(),
    }),
});

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    baseSchema.extend({
      summary: z.string().optional(),
      role: z.string().optional(),
      technologies: z.array(z.string()).optional(),
      tools: z.array(z.string()).optional(),
      cover: image().optional(),
      final: image().optional(),
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

const projectcards = defineCollection({
  type: "content",
  schema: ({ image }) =>
    baseCardSchema.extend({
      description: z.string().optional(),
      thumbnail: image().optional(),
      programming_languages: z.array(z.string()).optional(),
      domains: z.array(z.string()).optional(),
    }),
});

export const collections = {
  posts,
  experiences,
  experiencecards,
  projects,
  projectcards,
};
