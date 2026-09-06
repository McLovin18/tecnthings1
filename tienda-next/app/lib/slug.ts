/**
 * Generate a URL-safe slug from a product name
 * Example: "Mouse Logitech G502 RGB" -> "mouse-logitech-g502-rgb"
 */
export function generateProductSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-áéíóúñ]/g, '') // Remove special chars except accents
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse a slug to extract product ID from the end if present
 * Format can be: "slug-id123" or just "slug"
 * If slug ends with a mongo ID pattern, extract and return it
 */
export function extractProductIdFromSlug(slug: string): string | null {
  // Try to match Firestore/MongoDB style IDs at the end
  // Firestore IDs are typically 20 chars alphanumeric
  const match = slug.match(/^(.+-)?([a-zA-Z0-9]{15,})$/);
  if (match && match[2]) {
    return match[2];
  }
  return null;
}

/**
 * Create a full product slug with ID for uniqueness
 * Example: "mouse-logitech-g502-rgb-0ejPM5AUiJ2MvKBM8N8U"
 */
export function createFullProductSlug(nombre: string, id: string): string {
  const baseSlug = generateProductSlug(nombre);
  return `${baseSlug}-${id}`;
}

/**
 * Parse a full product slug to get the ID
 */
export function parseProductSlug(slug: string): { slug: string; id: string | null } {
  const id = extractProductIdFromSlug(slug);
  return {
    slug,
    id,
  };
}
