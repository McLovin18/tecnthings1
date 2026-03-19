"use client";


import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { crearOrden } from "../../lib/ordenes-db";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CartPage() {
  const { carrito, removeCarrito, addCarrito, user, setUser } = useUser();
  const isGuest = !user || !user.uid;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const router = useRouter();
  const todayStr = new Date().toISOString().split("T")[0];

  // Stripe client
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

  // --- Stripe inner form (uses PaymentElement) ---
  function StripeInnerForm({ orderId, total, onError, onSuccess }: { orderId: string; total: number; onError: (m: string) => void; onSuccess: () => void; }) {
    const stripe = useStripe();
    const elements = useElements();
    const [paying, setPaying] = useState(false);

    const handlePay = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;
      setPaying(true);

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/order-confirmation?orderId=${orderId}&paid=true` },
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
        <button type="submit" disabled={!stripe || paying} className="w-full py-4 rounded-2xl font-extrabold text-lg text-white bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#a855f7] hover:from-[#5b21b6] hover:via-[#6d28d9] hover:to-[#9333ea] active:scale-[0.98] shadow-xl shadow-purple-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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

  // --- Stripe modal ---
  function StripePaymentModal({ clientSecret, orderId, total, productos, onClose, onSuccess }: { clientSecret: string; orderId: string; total: number; productos: any[]; onClose: () => void; onSuccess: () => void; }) {
    const [stripeError, setStripeError] = useState("");

    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const appearance: any = { theme: isDark ? "night" : "stripe", variables: { colorPrimary: "#7c3aed" } };
    const options = { clientSecret, appearance };

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
              <button onClick={onClose} className="text-slate-500 hover:text-slate-700">Cerrar</button>
            </div>
          </div>
          <div className="px-6 py-5">
            {stripeError && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-700 dark:text-red-300">{stripeError}</div>}
            <Elements stripe={stripePromise} options={options}>
              <StripeInnerForm orderId={orderId} total={total} onError={setStripeError} onSuccess={onSuccess} />
            </Elements>
          </div>
        </div>
      </div>
    );
  }

  // Stripe state
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeOrderId, setStripeOrderId] = useState<string>("");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeDiag, setStripeDiag] = useState<string | null>(null);

  const handleStripeSuccess = () => {
    carrito.forEach((p) => removeCarrito(p.id));
    router.push(`/order-confirmation?orderId=${stripeOrderId}&paid=true`);
  };

  const handleIniciarPago = async () => {
    setError("");
    for (const p of carrito) {
      if (p.cantidad > p.stock) {
        setError(`Solo hay ${p.stock} unidades disponibles de "${p.nombre}".`);
        return;
      }
    }
    setStripeLoading(true);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrito: carrito.map((p) => ({ id: p.id, cantidad: p.cantidad })), email: user?.email || null, visitDate: visitDate || null, visitTime: visitTime || null, userId: user?.uid || null }),
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

  // Diagnostic check for PaymentRequest (Apple/Google Pay availability)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe) {
          if (mounted) setStripeDiag("stripe.js not loaded");
          return;
        }
        const pr = stripe.paymentRequest({ country: "US", currency: "usd", total: { label: "Test", amount: 100 } });
        const can = await pr.canMakePayment();
        if (!mounted) return;
        if (!can) setStripeDiag("PaymentRequest.canMakePayment returned null/false — Apple/Google Pay not available on this device or domain not verified.");
        else if ((can as any).applePay) setStripeDiag("Apple Pay available: true");
        else if ((can as any).googlePay) setStripeDiag("Google Pay available: true");
        else setStripeDiag(JSON.stringify(can));
      } catch (err: any) {
        console.error("stripe diag error", err);
        if (mounted) setStripeDiag(String(err?.message || err));
      }
    })();
    return () => { mounted = false; };
  }, [stripePromise]);

  const calcularPrecioUnitario = (p: any) => {
    const basePrice = Number(p.precio || 0);
    const discount = Number((p as any).descuento || 0);
    const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
    return hasDiscount ? basePrice * (1 - discount / 100) : basePrice;
  };

  // Generar orden: crea orden en estado 'generada' (no actualiza stock)
  const handleGenerarOrden = async () => {
    setError("");
    setLoading(true);
    try {
      if (!visitDate || !visitTime) {
        setError("Selecciona el día y la hora aproximada en que irás al local.");
        setLoading(false);
        return;
      }
      // Validar stock antes de procesar
      for (const p of carrito) {
        if (p.cantidad > p.stock) {
          setError(`Solo hay ${p.stock} unidades disponibles de "${p.nombre}".`);
          setLoading(false);
          return;
        }
      }
      // Crear orden: el backend (crearOrden) recalculará precios y total en base a Firestore
      const orden = {
        userId: user?.uid,
        productos: carrito.map(p => ({ id: p.id, cantidad: p.cantidad })),
        estado: "generada",
        visitaFecha: visitDate,
        visitaHora: visitTime,
      };
      await crearOrden(orden);
      // Vaciar carrito
      carrito.forEach(p => removeCarrito(p.id));
      // Redirigir a la vista de órdenes del cliente
      router.push("/home/ordenes");
    } catch (e) {
      console.error("Error al procesar la compra:", e);
      setError("Error al generar la orden. Intenta de nuevo.");
    }
    setLoading(false);
  };

  // Calcular totales
  const subtotal = carrito.reduce((sum, p) => {
    const unit = calcularPrecioUnitario(p);
    return sum + unit * (p.cantidad || 1);
  }, 0);
  const envio = 0;
  const total = subtotal + envio;

  const handleCantidad = (id, cantidad) => {
    if (cantidad < 1) return;
    const prod = carrito.find(p => p.id === id);
    if (prod) {
      if (cantidad > prod.stock) {
        setError(`Solo hay ${prod.stock} unidades disponibles en stock de "${prod.nombre}".`);
        return;
      }
      setError("");
      removeCarrito(id);
      addCarrito({ ...prod, cantidad });
    }
  };

  return (
    <>
      {stripeClientSecret && (
        <StripePaymentModal
          clientSecret={stripeClientSecret}
          orderId={stripeOrderId}
          total={total}
          productos={carrito}
          onClose={() => setStripeClientSecret(null)}
          onSuccess={handleStripeSuccess}
        />
      )}
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white transition-colors">
      <main className="max-w-6xl mx-auto px-4 py-8 lg:px-6 flex-1">
        <h1 className="text-3xl font-bold mb-8 text-[#3a1859] dark:text-white">Carrito de compras</h1>
        {isGuest && carrito.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
            Si quieres tener una mejor experiencia de compra, <a href="/login?tab=register" className="underline font-semibold">regístrate e inicia sesión</a>.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2">
            {carrito.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-icons-round text-6xl opacity-30 text-[#3a1859] dark:text-white">shopping_bag</span>
                <h3 className="text-xl font-semibold mt-4 text-[#3a1859] dark:text-white">Carrito vacío</h3>
                <a href="/home/products-by-category" className="inline-block mt-4 px-6 py-2 bg-accent text-white rounded-lg">Continuar comprando</a>
              </div>
            ) : (
              <div className="space-y-4">
                {carrito.map((p) => {
                  const unit = calcularPrecioUnitario(p);
                  const base = Number(p.precio || 0);
                  const discount = Number((p as any).descuento || 0);
                  const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
                  const lineTotal = unit * (p.cantidad || 1);
                  return (
                    <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-slate-800 rounded-xl shadow p-4">
                      <img src={p.imagenes?.[0] || "/no-image.png"} alt={p.nombre} className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg">{p.nombre}</div>
                        <div className="flex items-baseline gap-2 text-slate-500 dark:text-slate-300">
                          {hasDiscount ? (
                            <>
                              <span className="text-xs line-through text-slate-400 dark:text-slate-500">${base.toFixed(2)}</span>
                              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">${unit.toFixed(2)} c/u</span>
                              <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">-{discount}%</span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">${unit.toFixed(2)} c/u</span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
                          <label className="text-sm">Cantidad:</label>
                          <input
                            type="number"
                            min={1}
                            value={p.cantidad || 1}
                            onChange={e => handleCantidad(p.id, Number(e.target.value))}
                            className="w-16 sm:w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                          <button className="ml-2 text-red-600 hover:text-red-800" onClick={() => removeCarrito(p.id)}>
                            <span className="material-icons-round">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="font-bold text-lg text-right min-w-[4.5rem] mt-3 sm:mt-0">${lineTotal.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="rounded-xl p-6 md:sticky md:top-20 relative bg-white text-slate-900 dark:bg-[#3a1859] dark:text-white">
              <h2 className="text-lg font-bold mb-4">Resumen</h2>
              <div className="space-y-3 border-b border-slate-200 dark:border-[#6d28d9] pb-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span className="text-green-600 dark:text-green-400">Gratis</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {carrito.length > 0 && (
                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold">Día de visita al local</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={visitDate}
                      onChange={e => setVisitDate(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold">Hora aproximada de visita</label>
                    <input
                      type="time"
                      value={visitTime}
                      onChange={e => setVisitTime(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
              {carrito.length > 0 && (
                <>
                  <button
                    className="w-full block text-center px-6 py-4 mt-6 text-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-lg border-2 border-green-700 transition-all duration-200 disabled:opacity-60"
                    style={{ zIndex: 10, position: 'relative' }}
                    onClick={handleGenerarOrden}
                    disabled={loading || !visitDate || !visitTime}
                  >
                    {loading ? "Generando orden..." : "Generar orden"}
                  </button>

                  <button
                    className="w-full block text-center px-6 py-3 mt-3 text-lg bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#a855f7] text-white font-extrabold rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-60"
                    onClick={handleIniciarPago}
                    disabled={stripeLoading || !visitDate || !visitTime}
                  >
                    {stripeLoading ? "Preparando pago..." : `Pagar con tarjeta — $${total.toFixed(2)}`}
                  </button>
                </>
              )}
              {stripeDiag && (
                <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200">
                  <strong className="block text-xs font-semibold mb-1">Stripe paymentRequest diagnosis</strong>
                  <div className="break-words text-xs">{stripeDiag}</div>
                  <div className="text-xs text-slate-400 mt-2">Si ves "PaymentRequest.canMakePayment returned null" puede ser por dominio no verificado, Safari/Wallet no configurado, o falta de HTTPS.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  </>
  );
}
