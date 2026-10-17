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
 * Create a product slug without ID
 * Example: "mouse-logitech-g502-rgb"
 */
export function createProductSlugWithoutId(nombre: string): string {
  return generateProductSlug(nombre);
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

/**
 * Generate a URL-safe slug from a category name
 * Example: "Computadora" -> "computadora", "Computadora Gamer" -> "computadora-gamer"
 */
export function generateCategorySlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-áéíóúñ]/g, '') // Remove special chars except accents
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Create a combined slug for category hierarchy
 * Example: category="computadora", subcategory="gamer" -> "computadora-gamer"
 * Example: category="computadora", subcategory="gamer", subsubcategory="laptop" -> "computadora-gamer-laptop"
 */
export function createCategorySlug(category: string, subcategory?: string, subsubcategory?: string): string {
  const parts = [generateCategorySlug(category)];
  if (subcategory) parts.push(generateCategorySlug(subcategory));
  if (subsubcategory) parts.push(generateCategorySlug(subsubcategory));
  return parts.join('-');
}

/**
 * Parse a category slug to extract individual parts
 * This function needs to be called with the actual categorias data to correctly parse
 * Example: "computadora-gamer-laptop" -> { category: "computadora", subcategory: "gamer", subsubcategory: "laptop" }
 */
export function parseCategorySlug(slug: string): { category: string; subcategory?: string; subsubcategory?: string } {
  const parts = slug.split('-');
  return {
    category: parts[0] || '',
    subcategory: parts[1] || undefined,
    subsubcategory: parts[2] || undefined,
  };
}

/**
 * Parse a category slug using actual category data to handle names with hyphens correctly
 */
export function parseCategorySlugWithData(slug: string, categorias: any[]): { category: string; subcategory?: string; subsubcategory?: string } {
  // Try to find the category by matching the full slug or parts
  for (const cat of categorias) {
    const catSlug = generateCategorySlug(cat.nombre);
    
    // Check if it's just a category
    if (catSlug === slug) {
      return { category: catSlug };
    }
    
    // Check if it's category + subcategory
    if (cat.subcategorias) {
      for (const sub of cat.subcategorias) {
        const subSlug = generateCategorySlug(sub.nombre);
        const combinedSlug = `${catSlug}-${subSlug}`;
        
        if (combinedSlug === slug) {
          return { category: catSlug, subcategory: subSlug };
        }
        
        // Check if it's category + subcategory + subsubcategory
        if (sub.subcategorias) {
          for (const subsub of sub.subcategorias) {
            const subsubSlug = generateCategorySlug(subsub.nombre);
            const fullSlug = `${catSlug}-${subSlug}-${subsubSlug}`;
            
            if (fullSlug === slug) {
              return { category: catSlug, subcategory: subSlug, subsubcategory: subsubSlug };
            }
          }
        }
      }
    }
  }
  
  // Fallback to simple split
  const parts = slug.split('-');
  return {
    category: parts[0] || '',
    subcategory: parts[1] || undefined,
    subsubcategory: parts[2] || undefined,
  };
}
