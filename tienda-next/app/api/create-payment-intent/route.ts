import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import admin from "../../lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia" as any,
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { carrito, email, visitDate, visitTime, userId } = await req.json();

    if (!Array.isArray(carrito) || carrito.length === 0) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }

    const db = admin.firestore();
    let total = 0;
    const productosProcesados: any[] = [];

    // ── Leer precios desde Firestore (Admin SDK = sin restricciones de reglas) ──
    for (const item of carrito) {
      if (!item?.id) continue;
      const prodSnap = await db.collection("productos").doc(item.id).get();
      if (!prodSnap.exists) continue;
      const data = prodSnap.data() as any;

      const basePrice = Number(data.precio || 0);
      const discount = Number(data.descuento || 0);
      const hasDiscount = discount > 0 && discount < 100;
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
        imagenes: data.imagenes || [],
      });
    }

    if (productosProcesados.length === 0) {
      return NextResponse.json({ error: "No se encontraron productos válidos" }, { status: 400 });
    }

    // ── Generar orderId secuencial ──
    const metaRef = db.collection("ordenes_meta").doc("counter");
    const orderId: string = await db.runTransaction(async (tx) => {
      const snap = await tx.get(metaRef);
      const last = snap.exists ? (snap.data()?.lastNumber || 0) : 0;
      const next = last + 1;
      tx.set(metaRef, { lastNumber: next }, { merge: true });
      return `ord-${String(next).padStart(5, "0")}`;
    });

    // ── Crear orden en estado "pendiente_pago" ──
    const orderData = {
      orderId,
      userId: userId || null,
      guestEmail: email,
      productos: productosProcesados,
      total,
      estado: "pendiente_pago",
      metodoPago: "stripe",
      visitaFecha: visitDate || null,
      visitaHora: visitTime || null,
      createdAt: admin.firestore.Timestamp.now(),
    };
    const docRef = await db.collection("ordenes").add(orderData);

    // ── Crear Stripe PaymentIntent ──
    const currency = process.env.NEXT_PUBLIC_STRIPE_CURRENCY || "usd";
    const amountInCents = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: {
        orderId,
        firestoreId: docRef.id,
        email,
      },
      description: `TecnoThings – Orden ${orderId}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
      firestoreId: docRef.id,
    });
  } catch (err: any) {
    console.error("[create-payment-intent]", err);
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}
