// Obtener productos por subcategoría
export async function obtenerProductosPorSubcategoria(subcategoria, excludeId = null, max = 4) {
  const q = query(collection(db, COLLECTION), where("subcategoria", "==", subcategoria));
  const snapshot = await getDocs(q);
  let productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (excludeId) productos = productos.filter(p => p.id !== excludeId);
  return productos.slice(0, max);
}

// Obtener productos por subsubcategoría (último nivel)
export async function obtenerProductosPorSubsubcategoria(subsubcategoria, excludeId = null, max = 4) {
  const q = query(collection(db, COLLECTION), where("subsubcategoria", "==", subsubcategoria));
  const snapshot = await getDocs(q);
  let productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

// Crear producto
import { serverTimestamp } from "firebase/firestore";

export async function crearProducto(producto) {
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
export async function obtenerProductos() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Obtener productos por categoría
export async function obtenerProductosPorCategoria(categoria, excludeId = null, max = 4) {
  const q = query(collection(db, COLLECTION), where("categoria", "==", categoria));
  const snapshot = await getDocs(q);
  let productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (excludeId) productos = productos.filter(p => p.id !== excludeId);
  return productos.slice(0, max);
}

// Obtener producto por ID
export async function obtenerProductoPorId(id) {
  const docSnap = await getDoc(doc(db, COLLECTION, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

// Actualizar producto
export async function actualizarProducto(id, data) {
  await updateDoc(doc(db, COLLECTION, id), cleanUndefinedDeep(data));
}

// Eliminar producto
export async function eliminarProducto(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
