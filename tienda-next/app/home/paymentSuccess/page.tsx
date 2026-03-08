import React from "react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white transition-colors">
      <h1 className="text-3xl font-bold mb-6 text-green-600 dark:text-green-300">¡Pago exitoso!</h1>
      <p className="text-lg text-[#3a1859] dark:text-white/80">Tu compra fue procesada correctamente.</p>
    </div>
  );
}
