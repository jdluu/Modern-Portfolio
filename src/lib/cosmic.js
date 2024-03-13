import { createBucketClient } from "@cosmicjs/sdk";

const cosmic = createBucketClient({
	bucketSlug: import.meta.env.PUBLIC_COSMIC_BUCKET_SLUG,
	readKey: import.meta.env.PUBLIC_COSMIC_READ_KEY,
});

export async function getTests() {
	const data = await cosmic.objects
		.find({
			type: "tests",
		})
		.props("title, slug");
	return data.objects;
}

export async function getCards() {
	const data = await cosmic.objects
		.find({
			type: "cards",
		})
		.props("title, slug, metadata.description, metadata.thumbnail");
	return data.objects;
}
