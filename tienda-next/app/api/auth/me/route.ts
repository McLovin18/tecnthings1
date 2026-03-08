import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../lib/firebase-admin";

// Simulación: aquí deberías consultar tu base de datos para obtener el rol real
// Por ahora, si el email es admin@email.com => admin, si no => client

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "No token" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(token);
    // Lee el custom claim 'admin' del token
    let role = decoded.admin === true ? "admin" : "client";
    return NextResponse.json({ role });
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
