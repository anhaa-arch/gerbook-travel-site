/**
 * Utility functions for handling image paths from the database
 */

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
        // If the cleaned image contains commas, split it further
        if (cleanImg.includes(',')) {
          const splitImages = cleanImg.split(',').map((path: string) => path.trim());
          allImages.push(...splitImages);
        } else {
          allImages.push(cleanImg);
        }
      });
      return allImages;
    }
  } catch (e) {
    // If JSON parsing fails, treat as comma-separated string (legacy format)
    return images.split(',').map((img: string) => img.trim());
  }

  // Fallback to comma-separated string
  return images.split(',').map((img: string) => img.trim());
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
