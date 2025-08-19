import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
	process.env.NEXT_PUBLIC_TINA_BRANCH ||
	process.env.GITHUB_BRANCH ||
	process.env.VERCEL_GIT_COMMIT_REF ||
	process.env.HEAD ||
	"main";

export default defineConfig({
	branch,

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
	search: {
		tina: {
			indexerToken: process.env.TINA_SEARCH_TOKEN,
		},
	},
	// See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
	schema: {
		collections: [
			{
				name: "experiencecard",
				label: "Experience Cards",
				path: "content/experiencecards",
				format: "md",
				match: {
					include: "**/*.{md,mdx}",
					exclude: "tina/**"
				},
				ui: {
					// Build routes for the site from filename
					router: ({ document }) => `/experiences/${document._sys.filename.replace(/\\.mdx?$/i, "").toLowerCase()}`,
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
								name: "role",
								label: "Role",
							},
							{
								type: "string",
								name: "date",
								label: "Date",
								description: "Optional human-friendly date range (e.g. Jan 2022 — Present). If omitted UI will compute from startDate/endDate.",
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
								description: "Short summary shown on cards. If empty, the UI will fall back to a generated excerpt.",
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
					exclude: "tina/**"
				},
				ui: {
					router: ({ document }) => `/posts/${document._sys.filename.replace(/\\.mdx?$/i, "").toLowerCase()}`,
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
