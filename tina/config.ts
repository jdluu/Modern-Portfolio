import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
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
				name: "experience",
				label: "Experiences",
				path: "content/experiences",
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
								name: "description",
								label: "Description",
								ui: {
									component: "textarea",
								},
							},
							{
								type: "object",
								name: "company",
								label: "Company",
								fields: [
									{
										type: "string",
										name: "name",
										label: "Name",
									},
									{
										type: "image",
										name: "image",
										label: "Image",
									},
								],
							},
							{
								type: "object",
								name: "logistics",
								label: "Logistics",
								fields: [
									{
										type: "string",
										name: "duration",
										label: "Duration",
									},
									{
										type: "string",
										name: "role",
										label: "Role",
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
										label: "Tools",
									},
									{
										type: "string",
										name: "skills",
										label: "Skills",
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
										fields: [
											{
												type: "string",
												name: "duties",
												label: "Duties",
											},
										],
									},
									{
										type: "object",
										name: "achievements",
										label: "Achievements",
										list: true,
										fields: [
											{
												type: "string",
												name: "points",
												label: "Points",
											},
										],
									},
								],
							},
							{
								type: "object",
								name: "showcase",
								label: "Showcase",
								fields: [
									{
										type: "string",
										name: "link",
										label: "Link",
									},
									{
										type: "string",
										name: "description",
										label: "Description",
									},
								],
							},
						],
					},
				],
			},
			{
				name: "experiencecard",
				label: "Experience Cards",
				path: "content/experiencecards",
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
								name: "description",
								label: "Description",
								ui: {
									component: "textarea",
								},
							},
							{
								type: "string",
								name: "date",
								label: "Date",
							},
							{
								type: "image",
								name: "thumbnail",
								label: "Thumbnail",
							},
						],
					},
				],
			},
			{
				name: "post",
				label: "Posts",
				path: "content/posts",
				fields: [
					{
						type: "string",
						name: "title",
						label: "Title",
						isTitle: true,
						required: true,
					},
					{
						type: "datetime",
						name: "date",
						label: "Date",
					},
					{
						type: "string",
						name: "description",
						label: "Description",
						ui: {
							component: "textarea",
						},
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
