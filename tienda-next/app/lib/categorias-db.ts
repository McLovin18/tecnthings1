import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";
import { generateCategorySlug } from "./slug";

const COLLECTION = "categorias";

// Cache para categorías (expira en 5 minutos)
let categoriasCache: any[] | null = null;
let categoriasCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function sortCategoriasByOrder(categorias: any[]): any[] {
  return categorias
    .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999))
    .map(cat => ({
      ...cat,
      subcategorias: cat.subcategorias ? sortCategoriasByOrder(cat.subcategorias) : undefined
    }));
}

export async function obtenerCategorias() {
  const now = Date.now();
  
  // Retornar datos del caché si aún son válidos
  if (categoriasCache && (now - categoriasCacheTime) < CACHE_TTL) {
    return categoriasCache;
  }
  
  // Obtener datos frescos de Firebase
  const snapshot = await getDocs(collection(db, COLLECTION));
  const categorias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const sortedCategorias = sortCategoriasByOrder(categorias);
  
  // Actualizar caché
  categoriasCache = sortedCategorias;
  categoriasCacheTime = now;
  
  return sortedCategorias;
}



function cleanUndefinedDeep(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedDeep);
  } else if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanUndefinedDeep(v)])
    );
  }
  return obj;
}

export async function guardarCategoria(categoria) {
  await setDoc(doc(db, COLLECTION, categoria.id), cleanUndefinedDeep(categoria));
}

export async function actualizarCategoria(id, data) {
  await updateDoc(doc(db, COLLECTION, id), cleanUndefinedDeep(data));
}

export async function eliminarCategoria(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Find category ID by slug
 */
export async function findCategoryIdBySlug(slug: string): Promise<string | null> {
  const categorias = await obtenerCategorias();
  const category = categorias.find(cat => {
    const catSlug = generateCategorySlug(cat.nombre);
    return catSlug === slug;
  });
  return category?.id || null;
}

/**
 * Find category by slug and return the full category object
 */
export async function findCategoryBySlug(slug: string): Promise<any | null> {
  const categorias = await obtenerCategorias();
  const category = categorias.find(cat => {
    const catSlug = generateCategorySlug(cat.nombre);
    return catSlug === slug;
  });
  return category || null;
}

/**
 * Find subcategory ID by slug within a category
 */
export async function findSubcategoryIdBySlug(categorySlug: string, subcategorySlug: string): Promise<{ categoryId: string; subcategoryId: string } | null> {
  const categorias = await obtenerCategorias();
  const category = categorias.find(cat => {
    const catSlug = generateCategorySlug(cat.nombre);
    return catSlug === categorySlug;
  });
  
  if (!category || !category.subcategorias) return null;
  
  const subcategory = category.subcategorias.find((sub: any) => {
    const subSlug = generateCategorySlug(sub.nombre);
    return subSlug === subcategorySlug;
  });
  
  if (!subcategory) return null;
  
  return { categoryId: category.id, subcategoryId: subcategory.id };
}

/**
 * Find subsubcategory ID by slug within a subcategory
 */
export async function findSubsubcategoryIdBySlug(categorySlug: string, subcategorySlug: string, subsubcategorySlug: string): Promise<{ categoryId: string; subcategoryId: string; subsubcategoryId: string } | null> {
  const categorias = await obtenerCategorias();
  const category = categorias.find(cat => {
    const catSlug = generateCategorySlug(cat.nombre);
    return catSlug === categorySlug;
  });
  
  if (!category || !category.subcategorias) return null;
  
  const subcategory = category.subcategorias.find((sub: any) => {
    const subSlug = generateCategorySlug(sub.nombre);
    return subSlug === subcategorySlug;
  });
  
  if (!subcategory || !subcategory.subcategorias) return null;
  
  const subsubcategory = subcategory.subcategorias.find((subsub: any) => {
    const subsubSlug = generateCategorySlug(subsub.nombre);
    return subsubSlug === subsubcategorySlug;
  });
  
  if (!subsubcategory) return null;
  
  return { categoryId: category.id, subcategoryId: subcategory.id, subsubcategoryId: subsubcategory.id };
}
