"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import { Loading3DIcon } from "@/app/components/Loading3DIcon";
import { obtenerBodegas } from "../../lib/bodegas-db";

// ── Modal de Éxito ──────────────────────────────────────────────────────────
function SuccessModal({ visitDate, visitTime }: { visitDate: string; visitTime: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-[420px] rounded-3xl shadow-2xl bg-white dark:bg-[#0f0a23] border border-green-200 dark:border-green-900/40 p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">¡Listo! Tu orden fue generada</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm">
          Tu orden fue enviada correctamente a tu correo electrónico.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">Acércate al local en:</p>
          <p>📅 <strong>{visitDate}</strong> a las <strong>{visitTime}</strong></p>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Nos dirigiremos a la página de tus ordenes en 5 segundos...
        </p>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function CartPage() {
  const { carrito, removeCarrito, addCarrito, user } = useUser();
  const isGuest = !user || !user.uid;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  // email solo se usa cuando el usuario NO está logueado (invitados)
  const [email, setEmail] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const router = useRouter();
  const todayStr = new Date().toISOString().split("T")[0];

  // Email efectivo: del usuario logueado o del campo manual
  const emailFinal = user?.email || email;

  // ── Cálculo de precios ──────────────────────────────────────────────────────
  const calcularPrecioData = (p: any) => {
    const basePrice = Number(p.precioBase ?? p.precio ?? 0);
    const discount = Number(p.descuento || 0);
    const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
    const fakeOldPrice = hasDiscount
      ? Math.round((basePrice / (1 - discount / 100)) * 100) / 100
      : basePrice;
    return { basePrice, discount, hasDiscount, fakeOldPrice, finalPrice: basePrice };
  };

  const subtotal = carrito.reduce((sum, p) => {
    const { finalPrice } = calcularPrecioData(p);
    return sum + finalPrice * (p.cantidad || 1);
  }, 0);
  const total = subtotal;

  // ── Validaciones comunes ────────────────────────────────────────────────────
  const validarAntesDeEnviar = (): boolean => {
    if (!visitDate || !visitTime) {
      setError("Selecciona el día y la hora aproximada en que irás al local.");
      return false;
    }
    
    // Validar horario del local: 10:00 AM a 5:00 PM (17:00)
    const [hours, minutes] = visitTime.split(":").map(Number);
    const visitHourInMinutes = hours * 60 + minutes;
    const openingTime = 10 * 60; // 10:00 AM
    const closingTime = 17 * 60; // 5:00 PM (17:00)

    if (visitHourInMinutes < openingTime || visitHourInMinutes > closingTime) {
      setError("El local está cerrado a esa hora. Horario de atención: 10:00 AM a 5:00 PM.");
      return false;
    }
    if (!emailFinal || emailFinal.trim() === "" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFinal.trim())) {
      setError("Ingresa un correo electrónico válido para continuar.");
      return false;
    }
    for (const p of carrito) {
      if (p.cantidad > p.stock) {
        setError(`Solo hay ${p.stock} unidades disponibles de "${p.nombre}".`);
        return false;
      }
    }
    return true;
  };

  // ── Generar orden (sin pago) ────────────────────────────────────────────────
  // ── Generar mensaje de WhatsApp para no autenticados ────────────────────────
  const generateWhatsAppMessage = async (): Promise<string> => {
    // Obtener todas las bodegas para mapear bodegaId → tiempoEntrega
    const bodegas = await obtenerBodegas();
    const bodegasMap = new Map(bodegas.map(b => [b.id, b.tiempoEntrega]));

    const productosText = carrito
      .map((p) => {
        const { finalPrice, discount } = calcularPrecioData(p);
        const cantidad = p.cantidad || 1;
        const subtotalProducto = finalPrice * cantidad;
        const descuentoText = discount > 0 ? ` (-${discount}%)` : "";
        const tiempoEntrega = bodegasMap.get(p.bodegaId || "technothings") || 72;
        return `*${p.nombre}*${descuentoText}\nCantidad: ${cantidad} × $${finalPrice.toFixed(2)}\nSubtotal: $${subtotalProducto.toFixed(2)}\nEntrega Aproximada en: ${tiempoEntrega}h`;
      })
      .join("\n\n");
    
    const headerMsg = "Hola 🖐🏻 Me gustaría realizar una compra:";
    const footerMsg = "Quiero confirmar disponibilidad y conocer más detalles. ¡Gracias!";
    
    const message = `${headerMsg}\n\n${productosText}\n\n━━━━━━━━━━━━━━━\n*TOTAL: $${total.toFixed(2)}*\n━━━━━━━━━━━━━━━\n\n${footerMsg}`;
    return encodeURIComponent(message);
  };

  const handleGenerarOrden = async () => {
    setError("");

    // Enviar a WhatsApp para todos (invitados y autenticados)
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "34123456789";
    const message = await generateWhatsAppMessage();
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");

    // Google Analytics event: purchase
    if (typeof window !== "undefined" && (window as any).gtag) {
      const items = carrito.map((p) => {
        const { finalPrice } = calcularPrecioData(p);
        return {
          item_id: p.id,
          item_name: p.nombre,
          price: finalPrice,
          quantity: p.cantidad || 1,
        };
      });

      (window as any).gtag("event", "purchase", {
        currency: "USD",
        value: total,
        items: items,
      });
    }
  };


  // ── Cantidad ────────────────────────────────────────────────────────────────
  const handleCantidad = (id: string, cantidad: number) => {
    if (cantidad < 1) return;
    const prod = carrito.find((p) => p.id === id);
    if (!prod) return;
    if (cantidad > prod.stock) {
      setError(`Solo hay ${prod.stock} unidades disponibles de "${prod.nombre}".`);
      return;
    }
    setError("");
    removeCarrito(id);
    addCarrito({ ...prod, cantidad });
  };

  // ── Validación de submit ────────────────────────────────────────────────────────
  const canSubmit = !!visitDate && !!visitTime && !!emailFinal;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {showSuccessModal && (
        <SuccessModal visitDate={visitDate} visitTime={visitTime} />
      )}

      <div className="min-h-screen flex flex-col bg-white dark:bg-black text-slate-900 dark:text-white transition-colors">
        <main className="max-w-6xl mx-auto px-4 py-6 sm:py-15 lg:px-6 flex-1">
          <h1 className="text-3xl font-bold mb-8 text-[#3a1859] dark:text-white">Carrito de compras</h1>

          {isGuest && carrito.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
              Si quieres tener una mejor experiencia de compra,{" "}
              <a href="/login?tab=register" className="underline font-semibold">
                regístrate e inicia sesión
              </a>
              .
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Items del carrito ─────────────────────────────────────────── */}
            <div className="lg:col-span-2">
              {carrito.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-icons-round text-6xl opacity-30 text-[#3a1859] dark:text-white">
                    shopping_bag
                  </span>
                  <h3 className="text-xl font-semibold mt-4 text-[#3a1859] dark:text-white">Carrito vacío</h3>
                  <a
                    href="/home"
                    className="inline-block mt-4 px-6 py-2 bg-accent text-white rounded-lg"
                  >
                    Continuar comprando
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map((p) => {
                    const { hasDiscount, fakeOldPrice, finalPrice, discount } = calcularPrecioData(p);
                    const lineTotal = finalPrice * (p.cantidad || 1);
                    return (
                      <div
                        key={p.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-slate-800 rounded-xl shadow p-4"
                      >
                        <img
                          src={p.imagenes?.[0] || "/no-image.png"}
                          alt={p.nombre}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg border flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-lg">{p.nombre}</div>
                          <div className="flex items-baseline gap-2 text-slate-500 dark:text-slate-300">
                            {hasDiscount && (
                              <span className="text-xs line-through text-slate-400 dark:text-slate-500">
                                ${fakeOldPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-[#7b68ee]">
                              ${finalPrice.toFixed(2)} c/u
                            </span>
                            {hasDiscount && (
                              <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
                                -{discount}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
                              <button
                                onClick={() => handleCantidad(p.id, (p.cantidad || 1) - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 font-bold text-base"
                              >
                                −
                              </button>
                              <span className="w-7 text-center text-sm font-semibold">{p.cantidad || 1}</span>
                              <button
                                onClick={() => handleCantidad(p.id, (p.cantidad || 1) + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 font-bold text-base"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs text-slate-400">{p.stock} en stock</span>
                            <button
                              onClick={() => removeCarrito(p.id)}
                              className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg p-1.5 transition-colors"
                              title="Eliminar del carrito"
                            >
                              <span className="material-icons-round text-base">delete</span>
                            </button>
                          </div>
                        </div>
                        <div className="font-bold text-lg text-right min-w-[4.5rem] mt-3 sm:mt-0">
                          ${lineTotal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Sidebar resumen ───────────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#1e0a3c] rounded-2xl border border-slate-100 dark:border-purple-900/40 shadow-md p-5 md:sticky md:top-20 space-y-4">

                {/* Resumen de precios */}
                <div>
                  <p className="text-base font-bold mb-3">Resumen del pedido</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>Subtotal ({carrito.reduce((n, p) => n + (p.cantidad || 1), 0)} items)</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>Envío</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">Gratis</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-purple-900/40 mt-3 pt-3 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-[#7b68ee] dark:text-purple-300">${total.toFixed(2)}</span>
                  </div>
                </div>



                {/* Botón de acción - WhatsApp para todos */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Contacto rápido
                  </p>
                  <button
                    onClick={handleGenerarOrden}
                    className="w-full flex items-center text-center justify-center gap-2 py-3.5 px-6 bg-purple-700 hover:bg-[#20BA5C] text-white font-bold text-sm rounded-xl transition-colors shadow-md"
                    title="Enviar pedido por WhatsApp"
                  >
                    Generar orden
                  </button>
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">
                    Te enviaremos el resumen del pedido por WhatsApp
                  </p>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}