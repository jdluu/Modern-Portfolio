#!/usr/bin/env node
/**
 * Image compression script using TinyPNG API
 * 
 * Usage:
 *   pnpm compress-images [options]
 * 
 * Options:
 *   --path <path>     Specific directory to compress (default: all uploads)
 *   --dry-run         Show what would be compressed without actually compressing
 *   --overwrite       Overwrite original files (default: creates .min versions)
 */

import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { config } from "dotenv";

// Load .env file
config();

const require = createRequire(import.meta.url);
const tinify = require("tinify");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get API key from environment variable
const API_KEY = process.env.TINYPNG_API_KEY;

if (!API_KEY) {
  console.error("❌ Error: TINYPNG_API_KEY environment variable is not set.");
  console.error("   Get your API key from: https://tinypng.com/developers");
  console.error("   Then set it: export TINYPNG_API_KEY=your_api_key");
  process.exit(1);
}

tinify.key = API_KEY;

interface CompressionStats {
  total: number;
  compressed: number;
  skipped: number;
  errors: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  resizes: number;
}

const stats: CompressionStats = {
  total: 0,
  compressed: 0,
  skipped: 0,
  errors: 0,
  totalOriginalSize: 0,
  totalCompressedSize: 0,
  resizes: 0,
};

// Supported image extensions
const SUPPORTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const overwrite = args.includes("--overwrite");
const pathIndex = args.indexOf("--path");
const targetPath = pathIndex !== -1 && args[pathIndex + 1] 
  ? args[pathIndex + 1] 
  : path.join(__dirname, "..", "public", "uploads");

if (dryRun) {
  console.log("🔍 DRY RUN MODE - No files will be modified\n");
}

/**
 * Check if file is an image that can be compressed
 */
function isCompressibleImage(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * Get file size in bytes
 */
async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Calculate compression percentage
 */
function calculateSavings(original: number, compressed: number): string {
  const savings = original - compressed;
  const percentage = ((savings / original) * 100).toFixed(1);
  return `${percentage}% (${formatBytes(savings)} saved)`;
}

/**
 * Detect image type from filename to determine which sizes to generate
 */
function getImageSizesByType(filename: string): number[] {
  const basename = path.basename(filename, path.extname(filename)).toLowerCase();
  
  if (basename.startsWith("thumbnail_")) {
    // Thumbnails: 400w, 800w
    return [400, 800];
  } else if (basename.startsWith("cover_")) {
    // Cover images: 800w, 1200w, 1600w
    return [800, 1200, 1600];
  } else if (basename.startsWith("final_")) {
    // Final images: 800w, 1200w
    return [800, 1200];
  }
  
  // Other images: no resizes, just compression
  return [];
}

/**
 * Compress a single image file and generate size variants
 */
async function compressImage(filePath: string): Promise<void> {
  try {
    const originalSize = await getFileSize(filePath);
    stats.totalOriginalSize += originalSize;

    const filename = path.basename(filePath);
    const sizes = getImageSizesByType(filename);
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const dir = path.dirname(filePath);

    if (dryRun) {
      const resizeCount = sizes.length;
      console.log(`  📄 Would compress: ${filename} (${formatBytes(originalSize)})${resizeCount > 0 ? ` + ${resizeCount} resizes` : ""}`);
      stats.total++;
      return;
    }

    // Read the image file
    const sourceData = await fs.readFile(filePath);
    
    // Compress base image using TinyPNG
    const source = tinify.fromBuffer(sourceData);
    const compressedData = await source.toBuffer();
    const compressedSize = compressedData.length;
    stats.totalCompressedSize += compressedSize;

    // Determine base output path
    const baseOutputPath = overwrite 
      ? filePath 
      : path.join(dir, `${baseName}.min${ext}`);

    // Write compressed base image
    await fs.writeFile(baseOutputPath, compressedData);

    const savings = calculateSavings(originalSize, compressedSize);
    console.log(`  ✅ ${filename}: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${savings})`);
    
    stats.compressed++;
    stats.total++;

    // Generate resized versions if sizes are specified
    if (sizes.length > 0) {
      const baseNameWithoutExt = baseName.replace(/\.min$/, ""); // Remove .min if already present
      const finalBaseName = overwrite ? baseNameWithoutExt : `${baseNameWithoutExt}.min`;
      
      for (const size of sizes) {
        try {
          // Resize using TinyPNG API (each resize counts as 1 compression)
          // Use "scale" method which only requires width to maintain aspect ratio
          const resized = source.resize({
            method: "scale",
            width: size,
          });
          
          const resizedData = await resized.toBuffer();
          const resizedPath = path.join(dir, `${finalBaseName}-${size}w${ext}`);
          await fs.writeFile(resizedPath, resizedData);
          
          const resizedSize = resizedData.length;
          stats.totalCompressedSize += resizedSize;
          stats.resizes++;
          
          console.log(`    📐 ${size}w: ${formatBytes(resizedSize)}`);
        } catch (resizeError: any) {
          console.error(`    ❌ Error creating ${size}w variant:`, resizeError.message);
          stats.errors++;
        }
      }
    }
  } catch (error: any) {
    console.error(`  ❌ Error compressing ${path.basename(filePath)}:`, error.message);
    stats.errors++;
    stats.total++;
  }
}

/**
 * Recursively find and compress images in a directory
 */
async function processDirectory(dirPath: string): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other common directories
        if (entry.name.startsWith(".") || entry.name === "node_modules") {
          continue;
        }
        await processDirectory(fullPath);
      } else if (entry.isFile() && isCompressibleImage(fullPath)) {
        // Skip already compressed files
        if (entry.name.includes(".min.")) {
          stats.skipped++;
          continue;
        }
        await compressImage(fullPath);
      }
    }
  } catch (error: any) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }
}

/**
 * Validate API key
 */
async function validateApiKey(): Promise<boolean> {
  try {
    await new Promise<void>((resolve, reject) => {
      tinify.validate((err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
    return true;
  } catch (error: any) {
    console.error("❌ API key validation failed:", error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🖼️  TinyPNG Image Compression\n");
  console.log(`📁 Target directory: ${targetPath}\n`);

  // Validate API key
  console.log("🔑 Validating API key...");
  const isValid = await validateApiKey();
  if (!isValid) {
    process.exit(1);
  }
  console.log("✅ API key validated\n");

  // Check compression count
  const compressionCount = tinify.compressionCount;
  console.log(`📊 Compressions used this month: ${compressionCount}\n`);

  // Process directory
  console.log("🚀 Starting compression...\n");
  await processDirectory(targetPath);

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Compression Summary");
  console.log("=".repeat(50));
  console.log(`Total files processed: ${stats.total}`);
  console.log(`Successfully compressed: ${stats.compressed}`);
  console.log(`Resized variants created: ${stats.resizes}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Total compressions used: ${stats.compressed + stats.resizes}`);
  
  if (stats.compressed > 0 && !dryRun) {
    const totalSavings = calculateSavings(stats.totalOriginalSize, stats.totalCompressedSize);
    console.log(`\n💾 Total size reduction: ${totalSavings}`);
    console.log(`   Original: ${formatBytes(stats.totalOriginalSize)}`);
    console.log(`   Compressed: ${formatBytes(stats.totalCompressedSize)}`);
  }
  
  console.log("\n✅ Done!");
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

