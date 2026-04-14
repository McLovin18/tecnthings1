import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../lib/firebase-admin";
import { Resend } from "resend";

function buildVerificationEmailHTML(verificationLink: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Verifica tu email — TecnoThings</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: nearest-neighbor;
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);max-width:98vw;">
          
          <!-- Header con color corporativo -->
          <tr>
            <td style="background:#6d28d9;padding:40px 36px;text-align:center;" bgcolor="#6d28d9">
              <h1 style="margin:0;color:#ffffff;font-size:32px;letter-spacing:1px;font-weight:bold;line-height:1.2;">TecnoThings</h1>
              <p style="margin:8px 0 0;color:#e9d5ff;font-size:14px;line-height:1.4;">Verificación de correo electrónico</p>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding:40px 36px;">
              <h2 style="margin:0 0 16px;color:#1f2937;font-size:24px;font-weight:bold;text-align:center;line-height:1.3;">
                Verifica tu correo electrónico
              </h2>
              
              <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">
                ¡Bienvenido a TecnoThings! Para completar tu registro, necesitas verificar tu dirección de correo electrónico. Haz clic en el botón de abajo para continuar.
              </p>

              <!-- Botón de verificación - Bulletproof para todos los clientes -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;border-collapse:collapse;">
                <tr>
                  <td align="center" style="border-collapse:collapse;">
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;border-collapse:collapse;">
                      <tr>
                        <td style="border-collapse:collapse;border-spacing:0;background:#6d28d9;border-radius:8px;text-align:center;cursor:pointer;" bgcolor="#6d28d9">
                          <a href="${verificationLink}" style="display:block;background:#6d28d9;color:#ffffff;text-decoration:none;font-size:18px;font-weight:700;padding:16px 48px;border-radius:8px;line-height:1.3;font-family:Arial,sans-serif;text-align:center;min-width:200px;box-sizing:border-box;mso-padding-alt:16px 48px;border:none;" target="_blank" rel="noopener noreferrer">
                            Verificar mi correo
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Texto alternativo -->
              <p style="margin:24px 0 12px;color:#6b7280;font-size:13px;text-align:center;">
                O copia este enlace en tu navegador:
              </p>
              
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin:0;word-break:break-all;word-wrap:break-word;overflow-wrap:break-word;">
                <p style="margin:0;color:#374151;font-size:12px;font-family:'Courier New',monospace;line-height:1.4;word-break:break-all;">
                  <a href="${verificationLink}" style="color:#6d28d9;text-decoration:none;" target="_blank" rel="noopener noreferrer">${verificationLink}</a>
                </p>
              </div>

              <!-- Información sobre expiración -->
              <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;margin:32px 0 24px;border-radius:4px;border-collapse:collapse;">
                <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;font-weight:500;">
                  Importante: Este enlace expirará en 24 horas.
                </p>
              </div>

              <!-- Línea separadora -->
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

              <!-- Contacto de soporte -->
              <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;text-align:center;line-height:1.5;">
                ¿Problemas? Contáctanos en <a href="mailto:soporte@technothings.com" style="color:#6d28d9;text-decoration:none;">soporte@technothings.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 36px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.4;">
                © ${new Date().getFullYear()} TecnoThings. Todos los derechos reservados.
              </p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:10px;line-height:1.2;">
                Este es un correo de verificación automático. Por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    // Generar el link de verificación usando Firebase Admin SDK
    const firebaseLink = await adminAuth.generateEmailVerificationLink(email);
    
    // Extraer el oobCode del link de Firebase
    const url = new URL(firebaseLink);
    const oobCode = url.searchParams.get("oobCode");
    
    // Crear nuestro propio link personalizado
    // Usar el dominio actual o un dominio hardcodeado de producción
    const host = req.headers.get("host") || process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const verificationLink = `${protocol}://${host}/auth/verify-email?oobCode=${oobCode}`;

    // Inicializar Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log("[send-verification-email] Iniciando envío:", {
      to: email,
      from: "noreply@technothings.com",
      apiKeyExists: !!process.env.RESEND_API_KEY,
    });

    // Enviar email con Resend
    const emailResponse = await resend.emails.send({
      from: "noreply@technothings.com",
      to: email,
      subject: "Verifica tu correo electrónico — TecnoThings",
      html: buildVerificationEmailHTML(verificationLink),
      headers: {
        // Headers para asegurar que llegue a bandeja de entrada
        "X-Priority": "1",
        "Importance": "high",
        "X-MSMail-Priority": "High",
        // Identificar como email transaccional, no promocional
        "X-Entity-Ref-ID": "transactional-verification",
        // Precedence para algunos clientes de email
        "Precedence": "transactional",
      },
      reply_to: "soporte@technothings.com",
    });

    console.log("[send-verification-email] Respuesta de Resend:", emailResponse);

    if (emailResponse.error) {
      throw new Error(`Resend error: ${JSON.stringify(emailResponse.error)}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-verification-email] Error:", err);
    return NextResponse.json(
      { error: err.message || "Error al enviar correo de verificación" },
      { status: 500 }
    );
  }
}
