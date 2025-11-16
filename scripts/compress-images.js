import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - More aggressive compression
const BLOG_IMAGES_DIR = path.join(__dirname, '../src/assets/blogs');
const HERO_IMAGES_DIR = path.join(__dirname, '../src/assets/heros');
const MAX_WIDTH = 1200; // Reduced from 1920
const MAX_HEIGHT = 1200; // Reduced from 1920
const QUALITY = 70; // Reduced from 80 for smaller files

// Supported formats
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

/**
 * Recursively get all image files from a directory
 */
async function getImageFiles(dir) {
  const files = [];
  
  async function traverse(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await traverse(dir);
  return files;
}

/**
 * Get file size in MB
 */
async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

/**
 * Compress and optimize an image
 */
async function compressImage(inputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const dir = path.dirname(inputPath);
    const basename = path.basename(inputPath, ext);
    
    // Skip already compressed WebP files
    if (ext === '.webp') {
      console.log(`✓ Skipping ${path.basename(inputPath)} - already WebP`);
      return { skipped: true };
    }
    
    // Get original size
    const originalSize = await getFileSize(inputPath);
    
    // Load image metadata
    const metadata = await sharp(inputPath).metadata();
    
    // Create output WebP path
    const webpPath = path.join(dir, `${basename}.webp`);
    
    // Check if WebP already exists and is recent
    try {
      const webpExists = await fs.access(webpPath).then(() => true).catch(() => false);
      if (webpExists) {
        const originalStats = await fs.stat(inputPath);
        const webpStats = await fs.stat(webpPath);
        
        // If WebP is newer than original, skip
        if (webpStats.mtime >= originalStats.mtime) {
          console.log(`✓ Skipping ${path.basename(inputPath)} - WebP already exists`);
          return { skipped: true, originalSize };
        }
      }
    } catch (e) {
      // WebP doesn't exist, continue
    }
    
    // Process image with aggressive compression
    let pipeline = sharp(inputPath);
    
    // Resize if needed
    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Convert to WebP with aggressive quality settings
    await pipeline
      .webp({ 
        quality: QUALITY, 
        effort: 6,
        smartSubsample: true
      })
      .toFile(webpPath);
    
    const compressedSize = await getFileSize(webpPath);
    
    console.log(`✓ Compressed ${path.basename(inputPath)}: ${originalSize}MB → ${compressedSize}MB (${((1 - compressedSize/originalSize) * 100).toFixed(1)}% saved)`);
    
    return { 
      success: true, 
      originalSize, 
      compressedSize, 
      format: 'webp',
      path: webpPath
    };
  } catch (error) {
    console.error(`✗ Error compressing ${inputPath}:`, error.message);
    return { error: true, message: error.message };
  }
}

/**
 * Main compression function
 */
async function compressAllImages() {
  console.log('🖼️  Starting aggressive image compression...\n');
  
  const startTime = Date.now();
  const results = {
    processed: 0,
    skipped: 0,
    errors: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0
  };
  
  // Process blog images
  console.log('📁 Processing blog images...');
  const blogImages = await getImageFiles(BLOG_IMAGES_DIR);
  console.log(`Found ${blogImages.length} blog images\n`);
  
  for (const imagePath of blogImages) {
    const result = await compressImage(imagePath);
    
    if (result.skipped) {
      results.skipped++;
    } else if (result.error) {
      results.errors++;
    } else if (result.success) {
      results.processed++;
      results.totalOriginalSize += parseFloat(result.originalSize);
      results.totalCompressedSize += parseFloat(result.compressedSize);
    }
  }
  
  // Process hero images
  console.log('\n📁 Processing hero images...');
  const heroImages = await getImageFiles(HERO_IMAGES_DIR);
  console.log(`Found ${heroImages.length} hero images\n`);
  
  for (const imagePath of heroImages) {
    const result = await compressImage(imagePath);
    
    if (result.skipped) {
      results.skipped++;
    } else if (result.error) {
      results.errors++;
    } else if (result.success) {
      results.processed++;
      results.totalOriginalSize += parseFloat(result.originalSize);
      results.totalCompressedSize += parseFloat(result.compressedSize);
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  const savedSpace = (results.totalOriginalSize - results.totalCompressedSize).toFixed(2);
  const percentSaved = results.totalOriginalSize > 0 
    ? ((savedSpace / results.totalOriginalSize) * 100).toFixed(1)
    : 0;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Compression Summary');
  console.log('='.repeat(60));
  console.log(`✓ Processed: ${results.processed} images`);
  console.log(`⊘ Skipped: ${results.skipped} images`);
  console.log(`✗ Errors: ${results.errors} images`);
  console.log(`📦 Original size: ${results.totalOriginalSize.toFixed(2)} MB`);
  console.log(`📦 Compressed size: ${results.totalCompressedSize.toFixed(2)} MB`);
  console.log(`💾 Space saved: ${savedSpace} MB (${percentSaved}%)`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log('='.repeat(60) + '\n');
}

// Run compression
compressAllImages().catch(console.error);