import { NextRequest, NextResponse } from "next/server";
import admin from "../../../lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * 🛒 ENDPOINT: Crear Orden con Stock Deduction
 * 
 * Cuando el cliente genera una orden (proforma):
 * 1. Valida stock disponible
 * 2. Atomicamente deducen stock de cada producto
 * 3. Crea documento de orden en Firestore
 * 
 * Si algo falla, NADA se persiste (transactional integrity)
 * 
 * Esto asegura que el cliente que crea la orden tiene PRIORIDAD
 * Al deducir el stock, otros usuarios no pueden comprar ese stock
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      email,
      productos,
      visitDate,
      visitTime,
      clientPhone,
      clientName,
      clientAddress,
    } = body;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        { error: "Productos es requerido y debe ser un array no vacío" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    const db = admin.firestore();

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSACCIÓN ATÓMICA: Validar stock + Deducir stock + Crear orden
    // ─────────────────────────────────────────────────────────────────────────
    const resultado = await db.runTransaction(async (transaction) => {
      // ✅ PASO 1: TODAS LAS LECTURAS PRIMERO
      // -------------------------------------------
      
      // Lectura 1: Contador de órdenes
      const metaRef = db.collection("ordenes_meta").doc("counter");
      const metaSnap = await transaction.get(metaRef);

      // Lectura 2: Todos los productos
      const productRefs = productos
        .filter((item: any) => item?.id)
        .map((item: any) => db.collection("productos").doc(item.id));

      const productSnaps = await transaction.getAll(...productRefs);

      // ✅ PASO 2: PROCESAR LOS DATOS LEÍDOS (sin acceso a Firestore)
      // -------------------------------------------
      
      // Generar siguiente número de orden
      const last = metaSnap.exists ? (metaSnap.data()?.lastNumber || 0) : 0;
      const next = last + 1;
      const orderId = `ord-${String(next).padStart(5, "0")}`;

      // Validar stock y procesar productos
      const productDataMap = new Map<string, any>();
      const productosValidados: any[] = [];
      let total = 0;

      for (let i = 0; i < productSnaps.length; i++) {
        const snap = productSnaps[i];
        if (!snap.exists) continue;

        const productId = snap.id;
        const data = snap.data();
        const item = productos.find((p: any) => p.id === productId);

        if (!item) continue;

        const cantidad = Number(item.cantidad || 1);
        const stock = Number(data.stock || 0);

        // ✅ VALIDACIÓN: Stock suficiente (dentro de la transacción)
        if (stock < cantidad) {
          throw new Error(
            `Stock insuficiente para "${data.nombre}". Disponibles: ${stock}, Solicitados: ${cantidad}`
          );
        }

        // Calcular precio
        const basePrice = Number(data.precio || 0);
        const discount = Number(data.descuento || 0);
        const lineTotal = basePrice * cantidad;

        total += lineTotal;

        productDataMap.set(productId, data);
        productosValidados.push({
          id: productId,
          nombre: data.nombre,
          cantidad,
          precioBase: basePrice,
          descuento: discount,
          precioUnitario: basePrice,
          subtotal: lineTotal,
          stockSnapshot: stock,
          bodegaId: data.bodegaId || "technothings",
          precioSnapshot: {
            base: basePrice,
            descuento: discount,
            final: basePrice,
            timestamp: Date.now(),
          },
        });
      }

      // ✅ PASO 3: TODAS LAS ESCRITURAS (después de terminadas todas las lecturas)
      // -------------------------------------------

      // Escritura 1: Actualizar contador
      transaction.set(metaRef, { lastNumber: next }, { merge: true });

      // Escritura 2: Deducir stock de cada producto
      for (const productSnap of productSnaps) {
        if (!productSnap.exists) continue;

        const item = productos.find(
          (p: any) => p.id === productSnap.id
        );
        if (!item) continue;

        const cantidad = Number(item.cantidad || 1);

        // Deducir stock usando increment (atómico)
        transaction.update(productSnap.ref, {
          stock: admin.firestore.FieldValue.increment(-cantidad),
          lastStockUpdateAt: Timestamp.now(),
        });

        // Guardar historial en subcolección para auditoría
        const historyRef = productSnap.ref
          .collection("stock_history")
          .doc(`order_${orderId}_${Date.now()}`);
        transaction.set(historyRef, {
          type: "order_created",
          cantidad: -cantidad,
          orderId,
          timestamp: Timestamp.now(),
          orderType: "proforma",
        });
      }

      // Escritura 3: Crear documento de orden
      const now = Timestamp.now();
      const ordenData = {
        orderId,
        userId: userId || "guest",
        email,
        productos: productosValidados,
        total,
        estado: "generada", // Proforma/Generada
        visitaFecha: visitDate || null,      // ✅ Nombre correcto para admin
        visitaHora: visitTime || null,       // ✅ Nombre correcto para admin
        clientPhone: clientPhone || null,
        userName: clientName || null,        // ✅ Admin espera userName
        clientAddress: clientAddress || null,
        createdAt: now,
        stockReserved: true, // ✅ Stock ha sido deducido
        stockReservedAt: now,
      };

      const ordenRef = db.collection("ordenes").doc();
      transaction.set(ordenRef, ordenData);

      return {
        id: ordenRef.id,
        ...ordenData,
        createdAt: now.toDate(),
        stockReservedAt: now.toDate(),
      };
    });

    console.log(
      `✅ [ORDEN_CREADA] ${resultado.orderId} | ` +
      `Productos: ${resultado.productos.length} | ` +
      `Total: $${resultado.total.toFixed(2)} | ` +
      `Stock: DEDUCIDO`
    );

    return NextResponse.json({
      success: true,
      message: "Orden generada exitosamente. Stock reservado.",
      orden: resultado,
    });
  } catch (error: any) {
    console.error("[api/ordenes/crear] ❌ Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al crear la orden",
      },
      { status: error.message?.includes("Stock insuficiente") ? 409 : 500 }
    );
  }
}
