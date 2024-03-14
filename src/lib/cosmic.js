import { createBucketClient } from "@cosmicjs/sdk";

const cosmic = createBucketClient({
	bucketSlug: import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG,
	readKey: import.meta.env.PUBLIC_COSMIC_READ_KEY,
});

// Return All Card Objects
export async function getAllCards() {
	const data = await cosmic.objects
		.find({
			type: "cards",
		})
		.props("title, slug, metadata");
	return data.objects;
}

// Return All Project Objects
export async function getAllProjects() {
	const data = await cosmic.objects
		.find({
			type: "projects",
		})
		.props("title, slug, metadata");
	return data.objects;
}

// Return All Project Slugs
export async function getAllProjectSlugs() {
	const data = await cosmic.objects
		.find({
			type: "projects",
		})
		.props("slug");

	return data.objects;
}

export async function getProjectBySlug(slug) {
	const data = await cosmic.objects
		.findOne({
			type: "projects",
			slug,
		})
		.props("title, metadata");

	console.log("Project:", data); // Log the project object
	return data;
}
