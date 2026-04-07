import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { obtenerCategorias } from "../lib/categorias-db";

const PRODUCTOS = "productos";

async function main() {
  // 1. Obtener todas las categorías y subcategorías con sus IDs
  const categorias = await obtenerCategorias();
  // Crear mapas para lookup rápido
  const categoriaPorNombre: Record<string, string> = {};
  const subcategoriaPorNombre: Record<string, { id: string; categoriaId: string }> = {};
  const subsubcategoriaPorNombre: Record<string, { id: string; subcategoriaId: string; categoriaId: string }> = {};

  for (const cat of categorias) {
    categoriaPorNombre[cat.nombre.trim().toLowerCase()] = cat.id;
    if (Array.isArray(cat.subcategorias)) {
      for (const sub of cat.subcategorias) {
        subcategoriaPorNombre[sub.nombre.trim().toLowerCase()] = { id: sub.id, categoriaId: cat.id };
        if (Array.isArray(sub.subsubcategorias)) {
          for (const subsub of sub.subsubcategorias) {
            subsubcategoriaPorNombre[subsub.nombre.trim().toLowerCase()] = { id: subsub.id, subcategoriaId: sub.id, categoriaId: cat.id };
          }
        }
      }
    }
  }

  // 2. Obtener todos los productos
  const snapshot = await getDocs(collection(db, PRODUCTOS));
  for (const d of snapshot.docs) {
    const p = d.data();
    let update: any = {};
    // Normalizar categoriaId
    if (p.categoria && !p.categoriaId) {
      const id = categoriaPorNombre[p.categoria.trim().toLowerCase()];
      if (id) update.categoriaId = id;
    }
    // Normalizar subcategoriaId
    if (p.subcategoria && !p.subcategoriaId) {
      const sub = subcategoriaPorNombre[p.subcategoria.trim().toLowerCase()];
      if (sub) {
        update.subcategoriaId = sub.id;
        if (!update.categoriaId) update.categoriaId = sub.categoriaId;
      }
    }
    // Normalizar subsubcategoriaId
    if (p.subsubcategoria && !p.subsubcategoriaId) {
      const subsub = subsubcategoriaPorNombre[p.subsubcategoria.trim().toLowerCase()];
      if (subsub) {
        update.subsubcategoriaId = subsub.id;
        if (!update.subcategoriaId) update.subcategoriaId = subsub.subcategoriaId;
        if (!update.categoriaId) update.categoriaId = subsub.categoriaId;
      }
    }
    if (Object.keys(update).length > 0) {
      await updateDoc(doc(db, PRODUCTOS, d.id), update);
      console.log(`Producto ${d.id} actualizado:`, update);
    }
  }
  console.log("Normalización por ID completada.");
}

main().catch(console.error);
