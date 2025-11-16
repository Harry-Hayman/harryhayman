# Image Optimization - Build-Time Compression

## Overview

All blog and hero images are automatically compressed and optimized during the build process using Astro's built-in image optimization powered by Sharp. No manual compression is needed.

## How It Works

### Automatic Build-Time Processing

When you run `npm run build`, Astro automatically:

1. **Reads source images** from `src/assets/`
2. **Resizes** images to max 1200x1200px (maintaining aspect ratio)
3. **Converts** to WebP format
4. **Compresses** with 60% quality setting
5. **Generates responsive sizes** for different viewports
6. **Outputs optimized images** to `dist/_astro/`

### Configuration

#### [`astro.config.mjs`](astro.config.mjs)

```javascript
image: {
  service: {
    entrypoint: 'astro/assets/services/sharp',
    config: {
      limitInputPixels: false, // Handle large images
    }
  },
  formats: ['webp'],           // WebP for best compression
  quality: 60,                 // Aggressive compression (60%)
  domains: ['harryhayman.com'],
  remotePatterns: [{ protocol: "https" }]
}
```

#### [`src/components/OptimizedImage.astro`](src/components/OptimizedImage.astro)

```javascript
<Image
  src={src}
  alt={alt}
  width={1200}
  height={1200}
  format="webp"
  quality={60}
  loading="lazy"
  decoding="async"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px"
  densities={[1, 2]}  // Generate 1x and 2x versions
/>
```

## Image Pipeline

```
Source Images (JPG/PNG in src/assets/)
    ↓
[Astro Build Process]
    ↓
Sharp Processing:
  - Resize to max 1200x1200px
  - Convert to WebP
  - Compress at 60% quality
  - Generate responsive sizes
    ↓
Optimized WebP Images (in dist/)
    ↓
[Netlify Image CDN]
    ↓
End User
```

## Expected Results

### Size Reduction
- **60-80% reduction** for high-resolution photos
- **40-60% reduction** for medium-quality images
- **WebP format** provides superior compression vs JPEG/PNG

### Example Output

For a single source image, Astro generates:
```
src/assets/blogs/my-post/image.jpg (2.5MB original)
    ↓
dist/_astro/image.hash.webp (500KB - mobile)
dist/_astro/image.hash@2x.webp (800KB - mobile retina)
dist/_astro/image.hash-md.webp (300KB - tablet)
dist/_astro/image.hash-lg.webp (400KB - desktop)
```

## Performance Benefits

### Before Optimization
- Large source images: 500KB - 5MB each
- Total blog assets: ~1.8GB
- Long page load times
- Poor Core Web Vitals

### After Build Optimization
- Optimized images: 50KB - 500KB each
- Automatically served in WebP
- Responsive sizes for each device
- Lazy loading enabled
- Excellent Core Web Vitals scores

## Adding New Images

Simply add your source images to the appropriate directory:

```bash
src/assets/blogs/your-post-name/
├── hero-image.jpg
├── photo1.jpg
└── photo2.png
```

**No manual compression needed!** Just commit and push. The build process handles everything automatically.

## Best Practices

### Source Images

✅ **DO:**
- Use high-quality source images (original quality)
- Keep reasonable source sizes (< 10MB per file)
- Use JPG for photos, PNG for graphics with transparency
- Name files descriptively

❌ **DON'T:**
- Pre-compress images (Astro does this better)
- Resize images manually
- Convert to WebP yourself
- Worry about file sizes

### Component Usage

Always use the OptimizedImage component:

```astro
---
import OptimizedImage from '@/components/OptimizedImage.astro';
import heroImage from '@/assets/blogs/my-post/hero.jpg';
---

<OptimizedImage 
  src={heroImage} 
  alt="Descriptive alt text"
/>
```

### Build Performance

**First build:** Takes longer as all images are processed
**Subsequent builds:** Faster due to Astro's build cache
**Production builds:** Optimized and cached by Netlify

## Technical Details

### Sharp Configuration

Sharp (the underlying image processor) uses:
- **Smart resize**: Maintains aspect ratios
- **WebP encoding**: Lossy compression at 60% quality
- **Progressive encoding**: Faster perceived load
- **Metadata stripping**: Removes EXIF data for smaller files

### Responsive Images

Astro generates multiple sizes based on the `sizes` attribute:
- **Mobile** (< 640px): 100vw
- **Tablet** (< 1024px): 800px
- **Desktop** (>= 1024px): 1200px
- **Retina displays**: 2x density versions

### WebP Format

- **95%+ browser support** (all modern browsers)
- **Lossy & lossless** compression modes
- **Transparency support** (like PNG)
- **Better compression** than JPEG at same quality
- **Automatic fallback** for older browsers (via Astro)

## Netlify Integration

With `imageCDN: true` in the Netlify adapter:
- Images served via Netlify's global CDN
- Additional on-the-fly optimizations
- Edge caching for faster delivery
- Automatic format selection per browser

## Troubleshooting

### Build Failing

If builds fail due to image processing:

```bash
# Clear Astro cache
rm -rf .astro dist

# Rebuild
npm run build
```

### Images Too Large

If source images are extremely large (> 20MB):

1. **Reduce source size** before committing (resize to ~4000px max)
2. **Check file format** (use JPG for photos, not PNG)
3. **Verify image is needed** at that resolution

### Images Not Optimizing

Check these:

1. **Sharp installed**: `npm list sharp`
2. **Using OptimizedImage component**: Not plain `<img>` tags
3. **Correct import**: Using `import` for local images
4. **File path correct**: Relative to `src/assets/`

### Build Too Slow

For faster builds:

1. **Use Netlify cache**: Builds cache processed images
2. **Limit source size**: Keep images under 5MB
3. **Check image count**: Consider pagination for large galleries

## Monitoring

### Check Processed Images

After building, inspect output:

```bash
# See generated images
ls -lh dist/_astro/*.webp

# Count optimized images  
find dist/_astro -name "*.webp" | wc -l

# Check total size
du -sh dist/_astro/
```

### Performance Metrics

Monitor in Netlify or Lighthouse:
- **LCP (Largest Contentful Paint)**: Should be < 2.5s
- **CLS (Cumulative Layout Shift)**: Should be < 0.1
- **Image size**: Compare before/after in Network tab

## Configuration Reference

### Astro Image Settings

Available options in [`astro.config.mjs`](astro.config.mjs):

```javascript
image: {
  quality: 60,              // 1-100, lower = smaller files
  formats: ['webp'],        // Output formats
  domains: [],              // Allowed remote domains
  remotePatterns: [],       // URL patterns for remote images
  service: {
    entrypoint: 'astro/assets/services/sharp',
    config: {
      limitInputPixels: false  // Allow large source images
    }
  }
}
```

### Component Options

Available props for [`OptimizedImage.astro`](src/components/OptimizedImage.astro):

```typescript
interface Props {
  src: string;        // Image source (import or path)
  alt: string;        // Alt text (required for accessibility)
  width?: number;     // Max width (default: 1200)
  height?: number;    // Max height (default: 1200)
  class?: string;     // CSS classes
}
```

## Advanced Usage

### Different Quality Settings

For specific images needing higher quality:

```astro
<Image
  src={highQualityPhoto}
  alt="High quality photo"
  quality={80}
  format="webp"
/>
```

### Custom Sizes

For specific responsive behavior:

```astro
<Image
  src={photo}
  alt="Custom sizes"
  sizes="(max-width: 768px) 100vw, 50vw"
  widths={[400, 800, 1200]}
/>
```

### Multiple Formats

To serve both WebP and fallback:

```astro
<Image
  src={photo}
  alt="Multi-format"
  formats={['webp', 'jpg']}
/>
```

## Support

### Documentation
- **Astro Images**: https://docs.astro.build/en/guides/images/
- **Sharp**: https://sharp.pixelplumbing.com/
- **Netlify CDN**: https://docs.netlify.com/image-cdn/

### Common Issues

**Q: Can I use PNG?**  
A: Yes, but JPG is better for photos. Astro converts to WebP anyway.

**Q: Do I need to resize images?**  
A: No, Astro handles resizing automatically during build.

**Q: What about animated GIFs?**  
A: Use video formats (MP4, WebM) instead for better performance.

**Q: Can I disable optimization?**  
A: Not recommended, but you can use regular `<img>` tags for specific cases.

---

**Summary**: All image compression and optimization happens automatically during `npm run build`. Just add your source images and let Astro handle the rest!

*Last updated: 2025-11-16*
*Compression: Build-time only, no manual steps required*