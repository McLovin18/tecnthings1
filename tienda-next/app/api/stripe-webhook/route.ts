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

  const db = admin.firestore();

  // ── Manejar eventos ──────────────────────────────────────────────────────────
  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { orderId, firestoreId, email } = pi.metadata || {};

      if (firestoreId) {
        await db.collection("ordenes").doc(firestoreId).update({
          estado: "generada",
          stripePaymentIntentId: pi.id,
          stripeAmount: pi.amount,
          paidAt: admin.firestore.Timestamp.now(),
        });
        console.log(`[stripe-webhook] Orden ${orderId} marcada como generada (pagada).`);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { firestoreId } = pi.metadata || {};

      if (firestoreId) {
        await db.collection("ordenes").doc(firestoreId).update({
          estado: "pago_fallido",
          stripePaymentIntentId: pi.id,
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
