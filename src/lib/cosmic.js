import { createBucketClient } from "@cosmicjs/sdk";

const cosmic = createBucketClient({
	bucketSlug: import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG,
	readKey: import.meta.env.PUBLIC_COSMIC_READ_KEY,
});

export async function getAllCards() {
	const data = await cosmic.objects
		.find({
			type: "cards",
		})
		.props("title, slug, metadata");
	return data.objects;
}

export async function getAllProjects() {
	const data = await cosmic.objects
		.find({
			type: "projects",
		})
		.props("title, slug, metadata");
	return data.objects;
}
