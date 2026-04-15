"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Loading3DIcon } from "@/app/components/Loading3DIcon";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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

// ── Modal de Términos y Condiciones ─────────────────────────────────────────
function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] max-h-[80vh] overflow-y-auto rounded-3xl shadow-2xl bg-white dark:bg-[#0f0a23] border border-purple-100 dark:border-purple-900">
        <div className="sticky top-0 px-6 pt-6 pb-4 bg-white dark:bg-[#0f0a23] border-b border-purple-100 dark:border-purple-900 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Términos y Condiciones</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-6 text-sm text-slate-700 dark:text-slate-300 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">💳 Pago con Tarjeta</h3>
            <p>
              Al elegir <strong>pago virtual con tarjeta</strong>, el total puede variar según la plataforma de procesamiento de transacciones (Stripe) y su compatibilidad con tu banco.
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <p className="text-xs">
              <strong>Nota:</strong> El monto final puede incluir gastos de gestión de pago según tu entidad bancaria.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">📋 Método Alternativo</h3>
            <p>
              Puedes también elegir la opción <strong>"Generar orden"</strong> y completar el pago directamente en el local al retirar tu pedido, sin intermediarios de pago en línea.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">🔒 Transacciones Seguras</h3>
            <p>
              Todos los pagos con tarjeta son procesados a través de Stripe, una plataforma de pago segura y certificada internacionalmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


function StripeInnerForm({
  orderId,
  total,
  onError,
  onSuccess,
}: {
  orderId: string;
  total: number;
  onError: (m: string) => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation?orderId=${orderId}&paid=true`,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Error al procesar el pago.");
      setPaying(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess();
    } else {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <PaymentElement options={{ layout: "tabs", wallets: { applePay: "auto", googlePay: "auto" } }} />
      <button
        type="submit"
        disabled={!stripe || paying}
        className="w-full py-4 rounded-2xl font-extrabold text-lg text-white bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#a855f7] hover:from-[#5b21b6] hover:via-[#6d28d9] hover:to-[#9333ea] active:scale-[0.98] shadow-xl shadow-purple-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {paying ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Procesando...
          </>
        ) : (
          <>Pagar ${total.toFixed(2)}</>
        )}
      </button>
    </form>
  );
}

// ── Stripe modal ──────────────────────────────────────────────────────────────
function StripePaymentModal({
  clientSecret,
  orderId,
  total,
  onClose,
  onSuccess,
}: {
  clientSecret: string;
  orderId: string;
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [stripeError, setStripeError] = useState("");
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const appearance: any = { theme: isDark ? "night" : "stripe", variables: { colorPrimary: "#7c3aed" } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl bg-white dark:bg-[#0f0a23] border border-purple-100 dark:border-purple-900">
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-extrabold">Completa tu compra</h2>
              <p className="text-sm text-slate-500">Orden {orderId}</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              Cerrar
            </button>
          </div>
        </div>
        <div className="px-6 py-5">
          {stripeError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-700 dark:text-red-300">
              {stripeError}
            </div>
          )}
          <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
            <StripeInnerForm orderId={orderId} total={total} onError={setStripeError} onSuccess={onSuccess} />
          </Elements>
        </div>
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
  // "order" = generar orden sin pago, "stripe" = pago con tarjeta
  const [payMode, setPayMode] = useState<"order" | "stripe">("order");

  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeOrderId, setStripeOrderId] = useState<string>("");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
  // Agregar 7% si es pago con tarjeta
  const cardFee = payMode === "stripe" ? subtotal * 0.07 : 0;
  const total = subtotal + cardFee;

  // ── Validaciones comunes ────────────────────────────────────────────────────
  const validarAntesDeEnviar = (): boolean => {
    // SOLO pedir fecha/hora si es modo "order" (generar orden)
    // Para tarjeta (stripe) NO se requiere fecha/hora
    if (payMode === "order") {
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
    
    // Para guests: enviar a WhatsApp
    if (isGuest) {
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "34123456789"; // Reemplazar con número real
      const message = await generateWhatsAppMessage();
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
      return;
    }
    
    // Para autenticados: validar y crear orden
    if (!validarAntesDeEnviar()) return;
    setLoading(true);
    try {
      // 🚀 Llamar al endpoint API para crear orden con stock deduction atómico
      const res = await fetch("/api/ordenes/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || null,
          email: emailFinal.trim(),
          productos: carrito.map((p) => ({ id: p.id, cantidad: p.cantidad })),
          visitDate,
          visitTime,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Error al generar la orden");
      }

      // ✅ Orden creada exitosamente con stock reservado
      carrito.forEach((p) => removeCarrito(p.id));
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/home/ordenes");
      }, 5000);
    } catch (e: any) {
      console.error("Error al generar la orden:", e);
      setError(e.message || "Error al generar la orden. Intenta de nuevo.");
    }
    setLoading(false);
  };

  // ── Iniciar pago con Stripe ─────────────────────────────────────────────────
  const handleIniciarPago = async () => {
    setError("");
    if (!validarAntesDeEnviar()) return;
    setStripeLoading(true);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrito: carrito.map((p) => ({ id: p.id, cantidad: p.cantidad })),
          email: emailFinal.trim(),
          visitDate,
          visitTime,
          userId: user?.uid || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar el pago");
      setStripeClientSecret(data.clientSecret);
      setStripeOrderId(data.orderId);
    } catch (e: any) {
      setError(e.message || "No se pudo iniciar el pago. Intenta de nuevo.");
    }
    setStripeLoading(false);
  };

  const handleStripeSuccess = () => {
    carrito.forEach((p) => removeCarrito(p.id));
    router.push(`/order-confirmation?orderId=${stripeOrderId}&paid=true`);
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

  // ── Validación de submit dinámico según modo de pago ──────────────────────────
  const canSubmit = 
    payMode === "order" 
      ? !!visitDate && !!visitTime && !!emailFinal  // Order requiere fecha, hora y email
      : !!emailFinal;  // Stripe solo requiere email

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {showSuccessModal && (
        <SuccessModal visitDate={visitDate} visitTime={visitTime} />
      )}

      {showTermsModal && (
        <TermsModal onClose={() => setShowTermsModal(false)} />
      )}

      {stripeClientSecret && (
        <StripePaymentModal
          clientSecret={stripeClientSecret}
          orderId={stripeOrderId}
          total={total}
          onClose={() => setStripeClientSecret(null)}
          onSuccess={handleStripeSuccess}
        />
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
                    href="/home/products-by-category"
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
                    {cardFee > 0 && (
                      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="text-xs">💳</span> Gestión de pago
                        </span>
                        <span>${cardFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-100 dark:border-purple-900/40 mt-3 pt-3 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-[#7b68ee] dark:text-purple-300">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Selector de método de pago - solo para autenticados */}
                {!isGuest && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      ¿Cómo deseas pagar?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPayMode("order")}
                        className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                          payMode === "order"
                            ? "border-[#7b68ee] bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-purple-300"
                        }`}
                      >
                        {payMode === "order" && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                        <span className="material-icons-round text-lg">description</span>
                        Generar orden
                      </button>

                      <button
                        onClick={() => setPayMode("stripe")}
                        className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                          payMode === "stripe"
                            ? "border-transparent bg-[#7b68ee] text-white"
                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-purple-300"
                        }`}
                      >
                        {payMode === "stripe" && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                        <span className="material-icons-round text-lg">credit_card</span>
                        Pago con tarjeta
                      </button>
                    </div>

                    {payMode === "stripe" && (
                      <div className="mt-2 flex flex-wrap gap-1 justify-center">
                        {["Visa", "Mastercard", "Amex", "G Pay", "Apple Pay"].map((m) => (
                          <span
                            key={m}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Campos del formulario - solo para autenticados */}
                {!isGuest && (
                  <div className="space-y-3">
                    {/* Mostrar campos de fecha/hora solo para autenticados con orden */}
                    {payMode === "order" && (
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Día de visita al local
                          </label>
                          <input
                            type="date"
                            min={todayStr}
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Hora aproximada de visita
                          </label>
                          <input
                            type="time"
                            value={visitTime}
                            onChange={(e) => setVisitTime(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                      </>
                    )}

                    {/* Email: mostrar email del usuario autenticado */}
                    {user?.email ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/40">
                        <span className="material-icons-round text-purple-400 text-sm">mark_email_read</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{user.email}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          placeholder="tu@correo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {payMode === "order"
                            ? "Recibirás la confirmación de tu orden en este correo."
                            : "Recibirás el comprobante de pago aquí."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Botón de acción */}
                {isGuest ? (
                  // SOLO BOTÓN PARA INVITADOS
                  <button
                    onClick={handleGenerarOrden}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loading3DIcon />
                        <span className="ml-2">Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round text-base">whatsapp</span>
                        Generar orden
                      </>
                    )}
                  </button>
                ) : payMode === "order" ? (
                  <button
                    onClick={handleGenerarOrden}
                    disabled={loading || (!isGuest && !canSubmit)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loading3DIcon />
                        <span className="ml-2">Generando...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round text-base">description</span>
                        Generar orden
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleIniciarPago}
                      disabled={stripeLoading || !canSubmit}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-purple-700 via-purple-600 to-violet-500 hover:from-purple-800 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.98]"
                    >
                      {stripeLoading ? (
                        <>
                          <Loading3DIcon />
                          <span className="ml-2">Preparando pago...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-icons-round text-base">lock</span>
                          Ir al pago · ${total.toFixed(2)}
                        </>
                      )}
                    </button>
                    {/* Términos y condiciones */}
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      Aplican{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                      >
                        términos y condiciones
                      </button>
                    </div>
                  </>
                )}

                {/* Sello de seguridad */}
                <div className="flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500">
                  <span className="material-icons-round text-sm">lock</span>
                  <span className="text-[11px]">Pago seguro y encriptado</span>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}