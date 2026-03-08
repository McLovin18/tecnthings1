import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

const COLLECTION = "categorias";

export async function obtenerCategorias() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
