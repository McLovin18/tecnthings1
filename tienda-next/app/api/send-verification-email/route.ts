import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sendEmailVerification } from "firebase/auth";

function buildVerificationEmailHTML(verificationLink: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verifica tu email — TecnoThings</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);max-width:98vw;">
          
          <!-- Header con logo -->
          <tr>
            <td style="background:linear-gradient(135deg,#3a1859 0%,#6d28d9 100%);padding:40px 36px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;letter-spacing:1px;font-weight:bold;">TecnoThings</h1>
              <p style="margin:8px 0 0;color:#e9d5ff;font-size:14px;">Tu tienda de tecnología</p>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding:40px 36px;">
              <h2 style="margin:0 0 16px;color:#1f2937;font-size:24px;font-weight:bold;text-align:center;">
                Verifica tu correo electrónico
              </h2>
              
              <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;text-align:center;">
                ¡Bienvenido a TecnoThings! Para completar tu registro, necesitas verificar tu dirección de correo electrónico.
              </p>

              <!-- Botón de verificación -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${verificationLink}" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;padding:14px 40px;border-radius:8px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(109,40,217,0.3);transition:all 0.3s ease;" target="_blank">
                  Verificar mi correo
                </a>
              </div>

              <!-- Instrucciones alternativas -->
              <p style="margin:24px 0 12px;color:#6b7280;font-size:13px;text-align:center;">
                O copia y pega este enlace en tu navegador:
              </p>
              
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin:0;word-break:break-all;">
                <p style="margin:0;color:#374151;font-size:12px;font-family:'Courier New',monospace;line-height:1.4;">
                  ${verificationLink}
                </p>
              </div>

              <!-- Información importante -->
              <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;margin:32px 0 24px;border-radius:4px;">
                <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                  <strong>Importante:</strong> Este enlace expirará en 24 horas. Si no verificas tu correo en ese plazo, deberás registrarte nuevamente.
                </p>
              </div>

              <!-- Contacto -->
              <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;text-align:center;line-height:1.5;">
                Si no creaste esta cuenta o tienes problemas, contacta con nuestro equipo de soporte.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 36px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} TecnoThings. Todos los derechos reservados.
              </p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;">
                Este correo fue enviado automáticamente. No respondas a este mensaje.
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
    const { email, verificationLink } = await req.json();

    if (!email || !verificationLink) {
      return NextResponse.json(
        { error: "Email y verification link son requeridos" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Verifica tu correo electrónico — TecnoThings",
      html: buildVerificationEmailHTML(verificationLink),
      // Importante: headerssection para asegurar que es HTML
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Mailer": "NodeMailer",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-verification-email] Error:", err);
    return NextResponse.json(
      { error: err.message || "Error al enviar correo de verificación" },
      { status: 500 }
    );
  }
}
