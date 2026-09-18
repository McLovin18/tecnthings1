import { NextRequest, NextResponse } from "next/server";
import admin from "../../../lib/firebase-admin";

/**
 * ENDPOINT TEMPORAL: Revertir orden rechazada a su estado original
 * 
 * Este endpoint revierte:
 * - Estado de "rechazada" a su estado anterior
 * - Stock devuelto (si se devolvió)
 * - Reserva de stock (si se liberó)
 * 
 * SEGURIDAD: Requiere token de admin
 */

export async function POST(req: NextRequest) {
  try {
    // ✅ VERIFICAR TOKEN ADMIN
    const adminToken = req.headers.get("x-admin-token");
    const expectedToken = process.env.ADMIN_REJECT_TOKEN;
    
    if (!adminToken || !expectedToken || adminToken !== expectedToken) {
      return NextResponse.json(
        { error: "Token de admin inválido o no proporcionado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId es requerido" },
        { status: 400 }
      );
    }

    const db = admin.firestore();

    // 🔒 TRANSACCIÓN ATÓMICA
    const resultado = await db.runTransaction(async (transaction: any) => {
      // ✅ PASO 1: Obtener orden
      const ordenRef = db.collection("ordenes").doc(orderId);
      const ordenSnap = await transaction.get(ordenRef);

      if (!ordenSnap.exists) {
        throw new Error(`Orden no encontrada: ${orderId}`);
      }

      const orden = ordenSnap.data() as any;

      // ✅ Validación: Debe estar rechazada
      if (orden.estado !== "rechazada") {
        throw new Error(`Orden no está rechazada. Estado actual: ${orden.estado}`);
      }

      // ✅ PASO 2: Si el stock fue devuelto, revertirlo
      let stockRevertido = 0;
      if (orden.stockDevuelto === true && orden.productos) {
        for (const producto of orden.productos) {
          const productRef = db.collection("productos").doc(producto.id);
          
          // Restar el stock que fue devuelto
          transaction.update(productRef, {
            stock: admin.firestore.FieldValue.increment(-producto.cantidad),
            lastStockUpdateAt: admin.firestore.Timestamp.now(),
          });

          // Registrar en historial
          const historyRef = productRef
            .collection("stock_history")
            .doc(`revert_reject_${orderId}_${Date.now()}`);
          transaction.set(historyRef, {
            type: "order_rejection_reverted",
            cantidad: -producto.cantidad, // Negativo porque se está restando
            orderId: orden.orderId || orderId,
            timestamp: admin.firestore.Timestamp.now(),
            reason: "Revertir rechazo de orden",
          });

          stockRevertido++;
        }
      }

      // ✅ PASO 3: Si la reserva fue liberada, restaurarla
      if (orden.stockReservation && orden.stockReservation.reserveId) {
        const reserveRef = db
          .collection("stock_reserves")
          .doc(orden.stockReservation.reserveId);
        
        const reserveSnap = await transaction.get(reserveRef);
        if (reserveSnap.exists) {
          transaction.update(reserveRef, {
            status: "pending",
            rejectedAt: null,
            rejectedByAdmin: false,
            reason: null,
          });
        }
      }

      // ✅ PASO 4: Revertir estado de la orden
      const estadoAnterior = orden.estadoAnterior || "generada";
      transaction.update(ordenRef, {
        estado: estadoAnterior,
        rechazadaAt: null,
        rejectedBy: null,
        motivoRechazo: null,
        stockDevuelto: false,
        estadoAnterior: null, // Limpiar campo temporal
      });

      console.log(
        `✅ [ORDEN_REVERTIDA] ${orden.orderId || orderId} | ` +
        `Estado anterior: ${estadoAnterior} | ` +
        `Stock revertido: ${stockRevertido} productos`
      );

      return {
        orderId,
        ordenId: orden.orderId,
        estadoRestaurado: estadoAnterior,
        stockRevertido,
        paymentStatus: orden.status || orden.paymentStatus,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Orden ${resultado.ordenId} revertida exitosamente. Estado restaurado: ${resultado.estadoRestaurado}`,
      data: resultado,
    });
  } catch (error: any) {
    console.error("[api/admin/revert-rejected-order] ❌ Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al revertir la orden",
      },
      { status: error.message?.includes("no encontrada") ? 404 : 400 }
    );
  }
}
