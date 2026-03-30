/**
 * Utility functions for handling image paths from the database
 */

// Enable debug logging (only in development)
const DEBUG_MODE = process.env.NODE_ENV === 'development';

/**
 * Parses image paths from the database format
 * Handles both JSON array format and comma-separated string format
 * @param images - The images field from the database
 * @returns Array of clean image paths
 */
export function parseImagePaths(images: string | null | undefined): string[] {
  if (!images) {
    return ["/placeholder.svg"];
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.malchincamp.mn";

  const processImg = (img: string): string | null => {
    let cleanImg = img.replace(/^\[\[/, '').replace(/\]\]$/, '').replace(/^["']|["']$/g, '').trim();
    if (!cleanImg) return null;
    
    if (cleanImg.startsWith('data:image/') || cleanImg.startsWith('http')) {
      return cleanImg;
    }
    if (cleanImg.startsWith('/')) {
      if (cleanImg.startsWith('/uploads/')) return `${baseUrl}${cleanImg}`;
      return cleanImg;
    }
    if (cleanImg.startsWith('uploads/')) {
      return `${baseUrl}/${cleanImg}`;
    }
    return `${baseUrl}/uploads/${cleanImg}`;
  };

  try {
    const parsed = typeof images === 'string' && (images.startsWith('[') || images.startsWith('"')) 
      ? JSON.parse(images) 
      : images;
      
    if (Array.isArray(parsed)) {
      const allImages: string[] = [];
      parsed.forEach((img: any) => {
        if (typeof img === 'string') {
          if (img.includes(',') && !img.startsWith('data:')) {
            img.split(',').forEach((pStr: string) => {
              const processed = processImg(pStr);
              if (processed) allImages.push(processed);
            });
          } else {
            const processed = processImg(img);
            if (processed) allImages.push(processed);
          }
        }
      });
      return allImages.length > 0 ? allImages : ["/placeholder.svg"];
    }
  } catch (e) {
    if (DEBUG_MODE) console.error("parseImagePaths parsing error:", e);
  }

  // Fallback to comma-separated string
  if (typeof images === 'string') {
    const allImages: string[] = [];
    images.split(',').forEach(img => {
      const processed = processImg(img);
      if (processed) allImages.push(processed);
    });
    return allImages.length > 0 ? allImages : ["/placeholder.svg"];
  }

  return ["/placeholder.svg"];
}

/**
 * Gets the first image from a parsed image array
 * @param images - The images field from the database
 * @returns The first image path or placeholder
 */
export function getFirstImage(images: string | null | undefined): string {
  const parsedImages = parseImagePaths(images);
  return parsedImages[0] || "/placeholder.svg";
}

/**
 * Gets the primary image with better validation
 * @param images - The images field from the database
 * @returns The first valid image path or placeholder
 */
export function getPrimaryImage(images: string | null | undefined): string {
  if (!images) {
    return "/placeholder.svg";
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.malchincamp.mn";

  try {
    // Try to parse as JSON first
    const parsed = typeof images === 'string' && (images.startsWith('[') || images.startsWith('"')) 
      ? JSON.parse(images) 
      : images;

    let firstImg = "";
    if (Array.isArray(parsed) && parsed.length > 0) {
      firstImg = parsed[0];
    } else if (typeof parsed === 'string') {
      firstImg = parsed;
    }

    if (firstImg) {
      // Clean up the image string
      let cleanImg = firstImg.toString()
        .replace(/^\[\[/, '')
        .replace(/\]\]$/, '')
        .replace(/^["']|["']$/g, '')
        .trim();

      if (!cleanImg) return "/placeholder.svg";

      // If it's a complete data URL or full HTTP URL, return as is
      if (cleanImg.startsWith('data:image/') || cleanImg.startsWith('http')) {
        return cleanImg;
      }

      // If it already starts with / (absolute path)
      if (cleanImg.startsWith('/')) {
        // If it starts with /uploads/ it's likely a server file
        if (cleanImg.startsWith('/uploads/')) {
          return `${baseUrl}${cleanImg}`;
        }
        return cleanImg;
      }

      // If it starts with uploads/ (relative to base)
      if (cleanImg.startsWith('uploads/')) {
        return `${baseUrl}/${cleanImg}`;
      }

      // Default case: assume it's a filename that needs to be prefixed with /uploads/
      return `${baseUrl}/uploads/${cleanImg}`;
    }
  } catch (e) {
    if (DEBUG_MODE) console.error("getPrimaryImage parsing error:", e);
  }

  // Fallback for simple string format
  if (typeof images === 'string' && images.length > 0) {
     const cleanImg = images.replace(/^["']|["']$/g, '').trim();
     if (cleanImg.startsWith('/') || cleanImg.startsWith('http')) return cleanImg;
     return `${baseUrl}/uploads/${cleanImg}`;
  }

  return "/placeholder.svg";
}