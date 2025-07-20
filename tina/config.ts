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
			mediaRoot: "",
			publicFolder: "public",
		},
	},
	// See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
	schema: {
		collections: [
			{
				name: "project",
				label: "Projects",
				path: "content/projects",
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
						ui: {
							component: "textarea",
						},
					},
					{
						type: "image",
						name: "thumbnail",
						label: "Thumbnail",
					},
					{
						type: "rich-text",
						name: "content",
						label: "Content",
						isBody: true,
					},
					{
						type: "string",
						name: "programming_languages",
						label: "Programming Languages",
						list: true,
					},
					{
						type: "string",
						name: "domains",
						label: "Domains",
						list: true,
					},
				],
			},
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
						type: "string",
						name: "description",
						label: "Description",
						ui: {
							component: "textarea",
						},
					},
					{
						type: "image",
						name: "thumbnail",
						label: "Thumbnail",
					},
					{
						type: "rich-text",
						name: "content",
						label: "Content",
						isBody: true,
					},
					{
						type: "string",
						name: "date",
						label: "Date",
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
						type: "string",
						name: "description",
						label: "Description",
						ui: {
							component: "textarea",
						},
					},
					{
						type: "image",
						name: "thumbnail",
						label: "Thumbnail",
					},
					{
						type: "rich-text",
						name: "body",
						label: "Body",
						isBody: true,
					},
				],
			},
		],
	},
});
