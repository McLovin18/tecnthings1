"use client";
import CategoriesBar from "../components/CategoriesBar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paid = searchParams.get("paid") === "true";
  const redirectStatus = searchParams.get("redirect_status"); // Stripe redirect
  const [copied, setCopied] = useState(false);
  const { carrito, removeCarrito, isLogged } = useUser();

  // Limpiar carrito cuando llega desde redirect de Stripe (3DS/billeteras)
  useEffect(() => {
    if (redirectStatus === "succeeded" && carrito.length > 0) {
      carrito.forEach((p) => removeCarrito(p.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectStatus]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const orderLink = orderId ? `${origin}/order-confirmation?orderId=${orderId}` : null;
  const isPaidOrder = paid || redirectStatus === "succeeded";

  const handleCopy = () => {
    if (!orderLink) return;
    navigator.clipboard.writeText(orderLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
      className="min-h-screen flex flex-col mt-2"
    >
      <CategoriesBar />
      <main className="max-w-2xl mx-auto px-4 py-16 flex-1 flex flex-col items-center text-center">

        {/* Icono de éxito */}
        {isPaidOrder ? (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/30 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        ) : (
          <span className="material-icons-round text-green-500 text-7xl mb-4">check_circle</span>
        )}

        <h1 className="text-3xl font-bold mb-2 text-[#3a1859] dark:text-white">
          {isPaidOrder ? "¡Pago completado!" : "¡Orden generada con éxito!"}
        </h1>

        {isPaidOrder && (
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-bold border border-green-200 dark:border-green-700">
              💳 Pago verificado
            </span>
          </div>
        )}

        {orderId && (
          <div className="w-full mb-5 p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Número de orden</p>
            <p className="text-2xl font-extrabold text-[#3a1859] dark:text-white mb-3">{orderId}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Link único de tu orden (guárdalo para consultarla luego)</p>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              <span className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate text-left">{orderLink}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shrink-0"
              >
                <span className="material-icons-round text-sm">{copied ? "check" : "content_copy"}</span>
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        <p className="text-slate-600 dark:text-slate-300 mb-6">
          {isPaidOrder
            ? "Tu pago fue procesado exitosamente. Recibirás un comprobante en tu correo. Visita el local para retirar tus productos."
            : "Visita el local en la fecha y hora indicadas para retirar tus productos. Presenta el número de orden al llegar."}
        </p>

        {!isLogged && (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300 text-sm mb-6">
            ¿Quieres hacer seguimiento de tu orden?{" "}
            <Link href="/login?tab=register" className="underline font-semibold">
              Regístrate e inicia sesión
            </Link>{" "}
            para una mejor experiencia de compra.
          </div>
        )}

        <Link href="/" className="inline-block px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-lg">
          Volver al inicio
        </Link>
      </main>
    </div>
  );
}
