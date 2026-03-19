import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import admin from "../../lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia" as any,
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[stripe-webhook] Invalid signature:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Evitar procesar eventos de modo distinto (test vs live).
  // Determinamos el modo esperado a partir de la clave secreta configurada.
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const expectLive = secretKey.startsWith("sk_live_");
  if (typeof event.livemode === "boolean" && event.livemode !== expectLive) {
    console.warn(`[stripe-webhook] Ignoring event ${event.id} (livemode=${event.livemode}) because server is configured for ${expectLive ? 'live' : 'test'} mode.`);
    // Return 200 so Stripe won't keep retrying; we intentionally ignore cross-mode events.
    return NextResponse.json({ received: true });
  }

  const db = admin.firestore();

  // ── Manejar eventos ──────────────────────────────────────────────────────────
  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { orderId, firestoreId, email } = pi.metadata || {};

      if (firestoreId) {
        const orderRef = db.collection("ordenes").doc(firestoreId);
        const orderSnap = await orderRef.get();
        const orderData = orderSnap.exists ? orderSnap.data() as any : null;

        // Idempotencia: si ya está marcada como pagada, no hacer nada
        if (orderData?.paymentStatus === "paid") {
          console.log(`[stripe-webhook] Orden ${orderId} (firestoreId=${firestoreId}) ya marcada como pagada, evento ${event.id} ignorado.`);
        } else {
          await orderRef.update({
            estado: "generada",
            paymentStatus: "paid",
            stripePaymentIntentId: pi.id,
            stripeAmount: pi.amount,
            paidAt: admin.firestore.Timestamp.now(),
            stripeEventId: event.id,
            receiptUrl: (pi.charges && (pi.charges as any).data && (pi.charges as any).data[0]?.receipt_url) || null,
          });
          console.log(`[stripe-webhook] Orden ${orderId} marcada como generada (pagada).`);
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { firestoreId } = pi.metadata || {};

      if (firestoreId) {
        await db.collection("ordenes").doc(firestoreId).update({
          estado: "pago_fallido",
          paymentStatus: "failed",
          stripePaymentIntentId: pi.id,
          stripeEventId: event.id,
        });
        console.log(`[stripe-webhook] Orden ${pi.metadata?.orderId} marcada como pago_fallido.`);
      }
      break;
    }

    default:
      // Ignorar otros eventos
      break;
  }

  return NextResponse.json({ received: true });
}
