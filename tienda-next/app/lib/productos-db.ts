// Tipos
export interface Producto {
  id: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  descuento?: number;
  stock?: number;
  categoria?: string;
  subcategoria?: string;
  subsubcategoria?: string;
  marca?: string;
  destacado?: boolean;
  createdAt?: number | Date;
  fechaCreacion?: any;
  [key: string]: any;
}

// Obtener productos por subcategoría
// Si opts.incluirSinStock es true, no filtra por stock (solo para admin/inventario)
export async function obtenerProductosPorSubcategoria(subcategoria, excludeId = null, max = 4, opts = {}) {
  const q = query(collection(db, COLLECTION), where("subcategoria", "==", subcategoria));
  const snapshot = await getDocs(q);
  let productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (!opts.incluirSinStock) {
    productos = productos.filter(p => typeof p.stock !== "number" || p.stock > 0);
  }
  if (excludeId) productos = productos.filter(p => p.id !== excludeId);
  return productos.slice(0, max);
}

// Obtener productos por subsubcategoría (último nivel)
export async function obtenerProductosPorSubsubcategoria(subsubcategoria, excludeId = null, max = 4, opts = {}) {
  const q = query(collection(db, COLLECTION), where("subsubcategoria", "==", subsubcategoria));
  const snapshot = await getDocs(q);
  let productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (!opts.incluirSinStock) {
    productos = productos.filter(p => typeof p.stock !== "number" || p.stock > 0);
  }
  if (excludeId) productos = productos.filter(p => p.id !== excludeId);
  return productos.slice(0, max);
}
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";

const COLLECTION = "productos";

// Elimina recursivamente los campos undefined de un objeto
function cleanUndefinedDeep(obj: any): any {
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

// Crear producto
import { serverTimestamp } from "firebase/firestore";

export async function crearProducto(producto: Producto): Promise<Producto> {
  const cleanProducto = cleanUndefinedDeep(producto);
  // Agregar campo de fecha de creación
  const productoConFecha = {
    ...cleanProducto,
    fechaCreacion: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, COLLECTION), productoConFecha);
  return { ...cleanProducto, id: docRef.id };
}

// Obtener todos los productos
// Si opts.incluirSinStock es true, no filtra por stock (solo para admin/inventario)
export async function obtenerProductos(opts = {}) {
  const snapshot = await getDocs(collection(db, COLLECTION));
  let productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (!opts.incluirSinStock) {
    productos = productos.filter(p => typeof p.stock !== "number" || p.stock > 0);
  }
  return productos;
}

// Obtener productos por categoría
// Si opts.incluirSinStock es true, no filtra por stock (solo para admin/inventario)
export async function obtenerProductosPorCategoria(categoria, excludeId = null, max = 4, opts = {}) {
  const q = query(collection(db, COLLECTION), where("categoria", "==", categoria));
  const snapshot = await getDocs(q);
  let productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (!opts.incluirSinStock) {
    productos = productos.filter(p => typeof p.stock !== "number" || p.stock > 0);
  }
  if (excludeId) productos = productos.filter(p => p.id !== excludeId);
  return productos.slice(0, max);
}

// Obtener producto por ID
export async function obtenerProductoPorId(id: string): Promise<Producto | null> {
  const docSnap = await getDoc(doc(db, COLLECTION, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

// Actualizar producto
export async function actualizarProducto(id: string, data: Partial<Producto>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), cleanUndefinedDeep(data));
}

// Eliminar producto
export async function eliminarProducto(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
