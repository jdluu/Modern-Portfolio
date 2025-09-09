import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "experiencecard",
        label: "Experience Cards",
        path: "content/experiencecards",
        format: "md",
        match: {
          include: "**/*.{md,mdx}",
          exclude: "**/tina/**",
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "object",
            name: "metadata",
            label: "Metadata",
            fields: [
              {
                type: "string",
                name: "company",
                label: "Company",
              },
              {
                type: "string",
                name: "date",
                label: "Date",
                description:
                  "Optional human-friendly date range (e.g. Jan 2022 — Present). If omitted UI will compute from startDate/endDate.",
              },
              {
                type: "datetime",
                name: "startDate",
                label: "Start Date",
                required: false,
              },
              {
                type: "datetime",
                name: "endDate",
                label: "End Date",
                required: false,
                description: "Use 9999-12-31 for ongoing roles (Present).",
              },
              {
                type: "image",
                name: "thumbnail",
                label: "Thumbnail",
              },
              {
                type: "string",
                name: "summary",
                label: "Summary",
                description:
                  "Short summary shown on cards. If empty, the UI will fall back to a generated excerpt.",
              },
            ],
          },
        ],
      },
      {
        name: "projectcard",
        label: "Project Cards",
        path: "content/projectcards",
        format: "md",
        match: {
          include: "**/*.{md,mdx}",
          exclude: "**/tina/**",
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "object",
            name: "metadata",
            label: "Metadata",
            fields: [
              {
                type: "number",
                name: "year",
                label: "Year",
                description:
                  "Primary year used for list filtering/sorting (e.g., 2024).",
              },
              {
                type: "image",
                name: "thumbnail",
                label: "Thumbnail",
              },
              {
                type: "string",
                name: "summary",
                label: "Summary",
                description:
                  "Short summary shown on cards. If empty, the UI will fall back to a generated excerpt.",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "programming_languages",
                label: "Programming Languages",
                list: true,
                description:
                  "Used for filtering — enter values like JavaScript, Python, TypeScript, etc.",
              },
              {
                type: "string",
                name: "domains",
                label: "Domains",
                list: true,
                description:
                  "Used for filtering — enter values like Web, Mobile, AI, Data, etc.",
              },
            ],
          },
        ],
      },
      {
        name: "experience",
        label: "Experiences",
        path: "content/experiences",
        format: "md",
        match: {
          include: "**/*.{md,mdx}",
          exclude: "**/tina/**",
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "boolean",
            name: "draft",
            label: "Draft",
            description: "Hide from published lists",
          },
          {
            type: "object",
            name: "company",
            label: "Company",
            fields: [
              { type: "string", name: "name", label: "Name" },
              { type: "image", name: "image", label: "Logo" },
              { type: "string", name: "imagealt", label: "Logo Alt Text" },
            ],
          },
          {
            type: "object",
            name: "logistics",
            label: "Logistics",
            fields: [
              { type: "string", name: "role", label: "Role" },
              { type: "string", name: "duration", label: "Duration" },
              {
                type: "datetime",
                name: "startDate",
                label: "Start Date",
                required: false,
              },
              {
                type: "datetime",
                name: "endDate",
                label: "End Date",
                required: false,
                description: "Use 9999-12-31 for ongoing roles (Present).",
              },
            ],
          },
          {
            type: "object",
            name: "technologies",
            label: "Technologies",
            fields: [
              {
                type: "string",
                name: "tools",
                label: "Tools & Technologies",
                ui: { component: "textarea" },
                description: "Comma-separated list",
              },
              {
                type: "string",
                name: "skills",
                label: "Skills",
                ui: { component: "textarea" },
                description: "Comma-separated list",
              },
            ],
          },
          {
            type: "object",
            name: "work",
            label: "Work",
            fields: [
              {
                type: "object",
                name: "responsibilities",
                label: "Responsibilities",
                list: true,
                fields: [{ type: "string", name: "duties", label: "Duty" }],
              },
              {
                type: "object",
                name: "achievements",
                label: "Achievements",
                list: true,
                fields: [{ type: "string", name: "points", label: "Point" }],
              },
            ],
          },
          {
            type: "object",
            name: "showcase",
            label: "Showcase",
            fields: [
              { type: "string", name: "link", label: "Link" },
              { type: "string", name: "description", label: "Description" },
            ],
          },
          {
            type: "object",
            name: "card",
            label: "Card Settings (for listings)",
            description:
              "Optional: helps ExperienceCard render without additional mapping",
            fields: [
              { type: "string", name: "date", label: "Date Label" },
              { type: "image", name: "thumbnail", label: "Thumbnail" },
              {
                type: "string",
                name: "summary",
                label: "Summary",
                ui: { component: "textarea" },
              },
            ],
          },
        ],
      },
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        format: "md",
        match: {
          include: "**/*.{md,mdx}",
          exclude: "**/tina/**",
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            description: "Short summary for listings and SEO",
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
          },
          {
            type: "boolean",
            name: "draft",
            label: "Draft",
            description: "Mark as draft to hide from published lists",
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
          },
          {
            type: "image",
            name: "hero",
            label: "Hero Image",
          },
          {
            type: "string",
            name: "content",
            label: "Content",
            isBody: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "object",
            name: "links",
            label: "Links",
            list: true,
            fields: [
              {
                type: "string",
                name: "label",
                label: "Label",
                required: true,
                options: [
                  "Source Code",
                  "Website",
                  "Live Demo",
                  "Figma",
                  "Blog Post",
                ],
              },
              {
                type: "string",
                name: "url",
                label: "URL",
                required: true,
              },
            ],
          },
        ],
      },
    ],
  },
});
