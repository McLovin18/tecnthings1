import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y password son requeridos" },
        { status: 400 }
      );
    }

    // ⚠️ Crear usuario usando Admin SDK (NO autentica al cliente)
    const userRecord = await adminAuth.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      displayName: displayName?.trim() || undefined,
      emailVerified: false, // Asegurar que NO esté verificado
    });

    return NextResponse.json({ 
      success: true,
      uid: userRecord.uid,
      email: userRecord.email 
    });
  } catch (err: any) {
    console.error("[create-user-backend] Error:", err);
    
    // Manejar errores comunes
    if (err.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }
    
    if (err.code === "auth/invalid-password") {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
