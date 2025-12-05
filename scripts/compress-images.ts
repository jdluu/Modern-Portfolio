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
}

const stats: CompressionStats = {
  total: 0,
  compressed: 0,
  skipped: 0,
  errors: 0,
  totalOriginalSize: 0,
  totalCompressedSize: 0,
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
 * Compress a single image file
 */
async function compressImage(filePath: string): Promise<void> {
  try {
    const originalSize = await getFileSize(filePath);
    stats.totalOriginalSize += originalSize;

    if (dryRun) {
      console.log(`  📄 Would compress: ${path.basename(filePath)} (${formatBytes(originalSize)})`);
      stats.total++;
      return;
    }

    // Read the image file
    const sourceData = await fs.readFile(filePath);
    
    // Compress using TinyPNG
    const compressedData = await tinify.fromBuffer(sourceData).toBuffer();
    const compressedSize = compressedData.length;
    stats.totalCompressedSize += compressedSize;

    // Determine output path
    const outputPath = overwrite 
      ? filePath 
      : filePath.replace(/(\.[^.]+)$/, ".min$1");

    // Write compressed image
    await fs.writeFile(outputPath, compressedData);

    const savings = calculateSavings(originalSize, compressedSize);
    console.log(`  ✅ ${path.basename(filePath)}: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${savings})`);
    
    stats.compressed++;
    stats.total++;
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
      tinify.validate((err) => {
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
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  
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

