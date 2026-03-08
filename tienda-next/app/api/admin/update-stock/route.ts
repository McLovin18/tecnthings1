import { NextResponse } from "next/server";
import admin from "../../../lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[API update-stock] body recibido:", body);
    const { id, stock } = body;
    if (!id || typeof stock !== "number") {
      console.error("[API update-stock] Faltan datos: id o stock inválido", { id, stock });
      return NextResponse.json({ error: "ID y stock requeridos" }, { status: 400 });
    }
    await admin.firestore().collection("productos").doc(id).update({ stock });
    console.log(`[API update-stock] Stock actualizado para producto ${id} a ${stock}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("[API update-stock] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
