import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
  runTransaction,
} from "firebase/firestore";

const COLLECTION = "ordenes";

// Genera un número secuencial y lo convierte en ID tipo "ord-00001"
async function generarSiguienteOrderId(): Promise<string> {
  const metaRef = doc(db, `${COLLECTION}_meta`, "counter");
  const nextNumber = await runTransaction(db, async (tx) => {
    const snap = await tx.get(metaRef);
    const last = snap.exists() ? (snap.data().lastNumber || 0) : 0;
    const next = last + 1;
    tx.set(metaRef, { lastNumber: next }, { merge: true });
    return next;
  });
  const padded = String(nextNumber).padStart(5, "0");
  return `ord-${padded}`;
}

export async function crearOrden(orden: any) {
  const orderId = await generarSiguienteOrderId();

  const productosOrigen = Array.isArray(orden.productos) ? orden.productos : [];
  const productosProcesados: any[] = [];
  let total = 0;

  for (const item of productosOrigen) {
    if (!item?.id) continue;

    const prodRef = doc(db, "productos", item.id);
    const prodSnap = await getDoc(prodRef);
    if (!prodSnap.exists()) continue;

    const data: any = prodSnap.data();
    const basePrice = Number(data.precio || 0);
    const discount = Number(data.descuento || 0);
    const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
    const unitPrice = hasDiscount ? basePrice * (1 - discount / 100) : basePrice;
    const cantidad = Number(item.cantidad || 1);
    const lineTotal = unitPrice * cantidad;

    total += lineTotal;

    productosProcesados.push({
      id: item.id,
      nombre: data.nombre,
      cantidad,
      precioBase: basePrice,
      descuento: hasDiscount ? discount : 0,
      precioUnitario: unitPrice,
      subtotal: lineTotal,
    });
  }

  const payload = {
    ...orden,
    productos: productosProcesados,
    total,
    orderId,
    estado: orden.estado || "generada",
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, COLLECTION), payload);
  return { ...payload, id: docRef.id };
}

export async function obtenerOrdenesPorUsuario(uid) {
  const q = query(collection(db, COLLECTION), where("userId", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Admin: obtener todas las órdenes
export async function obtenerTodasOrdenes() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function obtenerOrdenPorId(id: string) {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as any;
}

export async function actualizarOrden(id: string, data: any) {
  await updateDoc(doc(db, COLLECTION, id), data);
}
