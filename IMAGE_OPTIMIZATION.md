# Image Optimization Guide

## Overview

This project uses an automated image compression system that converts all blog and hero images to WebP format with optimized dimensions and quality settings. The compression runs automatically before each build.

## Compression Settings

- **Maximum Width**: 1200px
- **Maximum Height**: 1200px
- **Quality**: 70%
- **Format**: WebP (with smart subsampling)
- **Effort**: 6 (high quality compression)

## How It Works

### 1. Compression Script

The [`scripts/compress-images.js`](scripts/compress-images.js) script:

- Recursively scans all images in `src/assets/blogs/` and `src/assets/heros/`
- Resizes images larger than 1200x1200px while maintaining aspect ratio
- Converts images to WebP format with 70% quality
- Skips already optimized images to save time
- Creates WebP versions alongside original files

### 2. Build Integration

The compression is integrated into the build process via [`package.json`](package.json):

```json
{
  "scripts": {
    "compress-images": "node scripts/compress-images.js",
    "prebuild": "npm run compress-images",
    "build": "astro build"
  }
}
```

The `prebuild` script ensures images are compressed before every build.

### 3. Component Usage

The [`OptimizedImage.astro`](src/components/OptimizedImage.astro) component:

- Automatically uses WebP versions when available
- Falls back to original formats if needed
- Uses Astro's built-in Image optimization
- Serves images with lazy loading and proper sizing

## Running Compression Manually

To compress images without building:

```bash
npm run compress-images
```

## Expected Results

Typical compression results:
- **70-90% size reduction** for high-resolution photos
- **50-70% reduction** for already optimized images
- **Original format preserved** alongside WebP versions

Example output:
```
✓ Compressed image.jpg: 5.42MB → 1.10MB (79% saved)
✓ Compressed photo.jpg: 2.41MB → 0.18MB (92% saved)
✓ Skipping small-image.jpg - already optimized
```

## File Structure

After compression, images exist in both formats:

```
src/assets/blogs/my-post/
├── image.jpg        # Original (kept for compatibility)
└── image.webp       # Compressed WebP version
```

## Performance Benefits

### Before Optimization
- Total blog images: ~1.8GB
- 2,178 images
- Average image size: ~850KB

### After Optimization
- WebP versions: ~400-600MB (estimated 65-70% reduction)
- Faster page loads
- Reduced bandwidth usage
- Better Core Web Vitals scores

## Technical Details

### WebP Format Benefits
- Superior compression vs JPEG/PNG
- Supports transparency (like PNG)
- Wider browser support (95%+ globally)
- Maintains visual quality at smaller sizes

### Compression Algorithm
- Uses Sharp library for high-quality processing
- Smart subsampling for better compression
- Progressive encoding for faster perceived load
- Automatic EXIF data stripping

## Troubleshooting

### Images Not Compressing

If images aren't being compressed:

1. Check the file extension is supported (`.jpg`, `.jpeg`, `.png`)
2. Verify the script has write permissions
3. Ensure Sharp is installed: `npm install sharp`

### Build Failures

If builds fail during compression:

1. Check available disk space
2. Review compression script logs
3. Temporarily skip compression: `npm run build --skip-prebuild`

### WebP Compatibility

Modern browsers support WebP. For older browsers:
- Original images remain available as fallback
- Astro's Image component handles format selection
- Progressive enhancement ensures compatibility

## Future Improvements

Potential optimizations:
- [ ] AVIF format support (even better compression)
- [ ] Responsive image srcsets
- [ ] Art direction for different viewports
- [ ] Automated image optimization on upload
- [ ] CDN integration for faster delivery

## Statistics

Monitor compression effectiveness:

```bash
# Check total size before compression
du -sh src/assets/blogs/

# Run compression
npm run compress-images

# Check size after (WebP files only)
find src/assets/blogs -name "*.webp" -exec du -ch {} + | tail -1
```

## Maintenance

### Adding New Images

New images are automatically compressed during the next build. No manual intervention needed.

### Updating Compression Settings

Edit [`scripts/compress-images.js`](scripts/compress-images.js):

```javascript
const MAX_WIDTH = 1200;  // Adjust max dimensions
const MAX_HEIGHT = 1200;
const QUALITY = 70;      // Adjust quality (1-100)
```

### Recompressing All Images

To force recompression of all images:

```bash
# Remove all WebP files
find src/assets -name "*.webp" -delete

# Run compression
npm run compress-images
```

## Best Practices

1. **Source Images**: Use high-quality originals (compression will optimize)
2. **File Names**: Use descriptive, web-friendly names
3. **Alt Text**: Always provide meaningful alt text in components
4. **Testing**: Test on various devices and connections
5. **Monitoring**: Regularly check compression ratios and quality

## Support

For issues or questions:
- Check compression logs in terminal output
- Review Sharp documentation: https://sharp.pixelplumbing.com/
- Verify Astro Image configuration: https://docs.astro.build/en/guides/images/

---

*Last updated: 2025-11-16*
*Compression system version: 1.0.0*