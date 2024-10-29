import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

async function optimizeImages() {
	// Optimize fractal image
	const fractalInput = "public/images/fractal.jpg";

	// Create WebP version
	await sharp(fractalInput)
		.webp({ quality: 80 })
		.toFile("public/images/fractal.webp");

	// Create AVIF version
	await sharp(fractalInput)
		.avif({ quality: 80 })
		.toFile("public/images/fractal.avif");
}

optimizeImages().catch(console.error);
