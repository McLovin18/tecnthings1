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

// Crear producto
export async function crearProducto(producto) {
  const docRef = await addDoc(collection(db, COLLECTION), producto);
  return { ...producto, id: docRef.id };
}

// Obtener todos los productos
export async function obtenerProductos() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Obtener productos por categoría
export async function obtenerProductosPorCategoria(categoria) {
  const q = query(collection(db, COLLECTION), where("categoria", "==", categoria));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Obtener producto por ID
export async function obtenerProductoPorId(id) {
  const docSnap = await getDoc(doc(db, COLLECTION, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

// Actualizar producto
export async function actualizarProducto(id, data) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

// Eliminar producto
export async function eliminarProducto(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
