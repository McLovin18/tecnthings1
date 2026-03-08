import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function buildProformaHTML(orden: any): string {
  const rows = orden.productos
    .map(
      (p: any) => `
      <tr>
        <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb;">${p.nombre}</td>
        <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; text-align:center;">${p.cantidad}</td>
        <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; text-align:right;">
          ${p.descuento > 0 ? `<span style="text-decoration:line-through;color:#9ca3af;font-size:12px;">$${Number(p.precioBase).toFixed(2)}</span><br/>` : ""}
          $${Number(p.precioUnitario).toFixed(2)}
          ${p.descuento > 0 ? `<span style="background:#fee2e2;color:#dc2626;border-radius:4px;padding:1px 5px;font-size:11px;margin-left:4px;">-${p.descuento}%</span>` : ""}
        </td>
        <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:bold;">$${Number(p.subtotal).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);max-width:98vw;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#3a1859,#6d28d9);padding:32px 36px;">
            <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:1px;">TecnoThings</h1>
            <p style="margin:6px 0 0;color:#e9d5ff;font-size:14px;">Proforma de Orden</p>
          </td>
        </tr>
        <!-- Order ID -->
        <tr>
          <td style="padding:24px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:13px;color:#6b7280;">Número de orden</p>
                  <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#3a1859;">${orden.orderId}</p>
                </td>
                <td align="right">
                  <p style="margin:0;font-size:13px;color:#6b7280;">Fecha de visita</p>
                  <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#374151;">${orden.visitaFecha} — ${orden.visitaHora}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Divider -->
        <tr><td style="padding:20px 36px 0;"><hr style="border:none;border-top:1px solid #e5e7eb;"/></td></tr>
        <!-- Products table -->
        <tr>
          <td style="padding:16px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="padding:10px 8px;text-align:left;font-size:13px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Producto</th>
                  <th style="padding:10px 8px;text-align:center;font-size:13px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Cant.</th>
                  <th style="padding:10px 8px;text-align:right;font-size:13px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Precio unit.</th>
                  <th style="padding:10px 8px;text-align:right;font-size:13px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </td>
        </tr>
        <!-- Total -->
        <tr>
          <td style="padding:0 36px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 8px;text-align:right;font-size:13px;color:#6b7280;">Envío</td>
                <td style="padding:8px 8px;text-align:right;font-size:13px;color:#16a34a;font-weight:600;width:110px;">Gratis</td>
              </tr>
              <tr style="background:#f5f3ff;border-radius:8px;">
                <td style="padding:12px 8px;text-align:right;font-size:17px;font-weight:bold;color:#3a1859;">Total</td>
                <td style="padding:12px 8px;text-align:right;font-size:20px;font-weight:bold;color:#6d28d9;width:110px;">$${Number(orden.total).toFixed(2)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Info box -->
        <tr>
          <td style="padding:0 36px 32px;">
            <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;">
              <p style="margin:0;font-size:14px;color:#92400e;">
                <strong>¿Qué sigue?</strong> Visita nuestro local el <strong>${orden.visitaFecha}</strong> a las <strong>${orden.visitaHora}</strong> para retirar tus productos. Presenta este número de orden: <strong>${orden.orderId}</strong>
              </p>
              <p style="margin:10px 0 0;font-size:13px;color:#92400e;">
                Para más opciones y seguimiento de pedidos, <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/login" style="color:#6d28d9;font-weight:bold;">regístrate en TecnoThings</a>.
              </p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 36px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Este correo fue enviado automáticamente por TecnoThings. No respondas a este mensaje.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { orden, email } = await req.json();

    if (!orden || !email) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
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
      subject: `Tu proforma de orden ${orden.orderId} — TecnoThings`,
      html: buildProformaHTML(orden),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-proforma] Error:", err);
    return NextResponse.json({ error: err.message || "Error al enviar correo" }, { status: 500 });
  }
}
