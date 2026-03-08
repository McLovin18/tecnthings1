"use client";


import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import { crearOrden } from "../../lib/ordenes-db";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { carrito, removeCarrito, addCarrito, user, setUser } = useUser();
  const isGuest = !user || !user.uid;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const router = useRouter();
  const todayStr = new Date().toISOString().split("T")[0];

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
                    <div key={p.id} className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl shadow p-4">
                      <img src={p.imagenes?.[0] || "/no-image.png"} alt={p.nombre} className="w-20 h-20 object-contain rounded-lg border" />
                      <div className="flex-1">
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
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-sm">Cantidad:</label>
                          <input
                            type="number"
                            min={1}
                            value={p.cantidad || 1}
                            onChange={e => handleCantidad(p.id, Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                          <button className="ml-2 text-red-600 hover:text-red-800" onClick={() => removeCarrito(p.id)}>
                            <span className="material-icons-round">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="font-bold text-lg text-right min-w-[4.5rem]">${lineTotal.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="rounded-xl p-6 sticky top-20 bg-white text-slate-900 dark:bg-[#3a1859] dark:text-white">
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
                <button
                  className="w-full block text-center px-6 py-4 mt-6 text-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-lg border-2 border-green-700 transition-all duration-200 disabled:opacity-60"
                  style={{ zIndex: 10, position: 'relative' }}
                  onClick={handleGenerarOrden}
                  disabled={loading || !visitDate || !visitTime}
                >
                  {loading ? "Generando orden..." : "Generar orden"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
