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
        if (cleanImg && (cleanImg.startsWith('http') || cleanImg.startsWith('/') || cleanImg.startsWith('data:image/'))) {
          // If the cleaned image contains commas, split it further
          if (cleanImg.includes(',') && !cleanImg.startsWith('data:')) {
            const splitImages = cleanImg.split(',').map((path: string) => path.trim());
            allImages.push(...splitImages.filter(p => p && (p.startsWith('http') || p.startsWith('/') || p.startsWith('data:image/'))));
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
    const validParts = parts.filter(p => p && (p.startsWith('http') || p.startsWith('/') || p.startsWith('data:image/')));
    return validParts.length > 0 ? validParts : ["/placeholder.svg"];
  }

  // Fallback to comma-separated string
  const parts = images.split(',').map((img: string) => img.trim());
  const validParts = parts.filter(p => p && (p.startsWith('http') || p.startsWith('/') || p.startsWith('data:image/')));
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

  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(images);
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Get the first image and clean it
      let firstImg = parsed[0];
      
      if (typeof firstImg === 'string') {
        // Remove extra brackets, quotes, and whitespace
        firstImg = firstImg.replace(/^\[\[/, '').replace(/\]\]$/, '').replace(/^["']|["']$/g, '').trim();
        
        // Check if it's a complete data URL
        if (firstImg.startsWith('data:image/')) {
          return firstImg;
        }
        
        // If it's a server upload path, ensure it starts with the correct base URL
        if (firstImg.startsWith('uploads/') || firstImg.startsWith('/uploads/')) {
          const cleanPath = firstImg.startsWith('/') ? firstImg : '/' + firstImg;
          return `http://localhost:8000${cleanPath}`;
        }
        
        // If it's already a full URL, return it
        if (firstImg.startsWith('http://') || firstImg.startsWith('https://')) {
          return firstImg;
        }
        
        // If it's a relative path starting with /, return it as is
        if (firstImg.startsWith('/')) {
          return firstImg;
        }
        
        // If we have some value but it doesn't match known patterns, try to use it anyway
        if (firstImg.length > 0) {
          if (DEBUG_MODE) console.warn("getPrimaryImage: unexpected image format:", firstImg);
          return firstImg;
        }
      }
    }
  } catch (e) {
    // If it's just "/placeholder.svg" or a simple string, return it
    if (typeof images === 'string') {
      const cleanImg = images.trim();
      
      // Check if it's a complete data URL
      if (cleanImg.startsWith('data:image/')) {
        return cleanImg;
      }
      
      // Handle server upload paths
      if (cleanImg.startsWith('uploads/') || cleanImg.startsWith('/uploads/')) {
        const cleanPath = cleanImg.startsWith('/') ? cleanImg : '/' + cleanImg;
        return `http://localhost:8000${cleanPath}`;
      }
      
      // If it's a placeholder or full URL, return as is
      if (cleanImg.startsWith('/') || cleanImg.startsWith('http')) {
        return cleanImg;
      }
      
      // Try comma-separated if it contains commas
      if (cleanImg.includes(',')) {
        const parts = cleanImg.split(',').map(p => p.trim());
        if (parts.length > 0) {
          let firstPart = parts[0].replace(/^["']|["']$/g, '').trim();
          
          if (firstPart.startsWith('data:image/')) {
            return firstPart;
          }
          
          if (firstPart.startsWith('uploads/') || firstPart.startsWith('/uploads/')) {
            const cleanPath = firstPart.startsWith('/') ? firstPart : '/' + firstPart;
            return `http://localhost:8000${cleanPath}`;
          }
          
          if (firstPart && (firstPart.startsWith('http') || firstPart.startsWith('/'))) {
            return firstPart;
          }
        }
      }
    }
  }
  
  return "/placeholder.svg";
}