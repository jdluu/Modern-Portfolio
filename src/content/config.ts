import { defineCollection, z } from "astro:content";

//  * Content Collections configuration
//  *
//  * Collections:
//  * - posts: src/content/posts/**/*.{md,mdx}
//  * - experiences: src/content/experiences/**/*.{md,mdx}
//  * - experiencecards: src/content/experiencecards/**/*.{md,mdx}
//  * - projects: src/content/projects/**/*.{md,mdx}
//  * - projectcards: src/content/projectcards/**/*.{md,mdx}
//  *
//  * Schemas mirror existing frontmatter found under the legacy ./content/ directory.

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Accept either a string or a parsed Date (MD frontmatter may be parsed as Date)
    date: z.union([z.string(), z.coerce.date()]).optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    hero: z.string().optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        })
      )
      .optional(),
    slug: z.string().optional(),
  }),
});

const experiences = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    draft: z.boolean().optional(),
    company: z
      .object({
        name: z.string().optional(),
        image: z.string().optional(),
        imagealt: z.string().optional(),
      })
      .optional(),
    logistics: z
      .object({
        role: z.string().optional(),
        duration: z.string().optional(),
        // Allow either string or Date (frontmatter may be parsed into a Date)
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
    slug: z.string().optional(),
  }),
});

const experiencecards = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    metadata: z
      .object({
        company: z.string().optional(),
        date: z.union([z.string(), z.coerce.date()]).optional(),
        startDate: z.union([z.string(), z.coerce.date()]).optional(),
        endDate: z.union([z.string(), z.coerce.date()]).optional(),
        thumbnail: z.string().optional(),
        summary: z.string().optional(),
      })
      .optional(),
    slug: z.string().optional(),
  }),
});

export const collections = {
  posts,
  experiences,
  experiencecards,
  projects,
  projectcards,
};
