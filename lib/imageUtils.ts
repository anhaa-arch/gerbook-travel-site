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

  try {
    // Try to parse as JSON first (for new format)
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) {
      const allImages: string[] = [];
      parsed.forEach((img: string) => {
        // Remove extra brackets and quotes from the path
        const cleanImg = img.replace(/^\[\[/, '').replace(/\]\]$/, '').trim();

        // Only add valid image URLs/paths
        if (typeof cleanImg === 'string' && cleanImg && (cleanImg.startsWith('http') || cleanImg.startsWith('/') || cleanImg.startsWith('data:image/'))) {
          // If the cleaned image contains commas, split it further
          if (cleanImg.includes(',') && !cleanImg.startsWith('data:')) {
            const splitImages = cleanImg.split(',').map((path: string) => path.trim());
            allImages.push(...splitImages.filter(p => typeof p === 'string' && p && (p.startsWith('http') || p.startsWith('/') || p.startsWith('data:image/'))));
          } else {
            allImages.push(cleanImg);
          }
        }
      });
      return allImages.length > 0 ? allImages : ["/placeholder.svg"];
    }
  } catch (e) {
    // If JSON parsing fails, treat as comma-separated string (legacy format)
    const parts = images.split(',').map((img: string) => img.trim());
    const validParts = parts.filter(p => typeof p === 'string' && p && (p.startsWith('http') || p.startsWith('/') || p.startsWith('data:image/')));
    return validParts.length > 0 ? validParts : ["/placeholder.svg"];
  }

  // Fallback to comma-separated string
  const parts = images.split(',').map((img: string) => img.trim());
  const validParts = parts.filter(p => typeof p === 'string' && p && (p.startsWith('http') || p.startsWith('/') || p.startsWith('data:image/')));
  return validParts.length > 0 ? validParts : ["/placeholder.svg"];
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