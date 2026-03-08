"use client";
import React from "react";
import Link from "next/link";

export default function PaymentSuccessPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-white to-purple-100 dark:from-[#1e293b] dark:via-[#3a1859] dark:to-[#1e293b] transition-colors">
			<div className="bg-white dark:bg-[#3a1859] rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full border-2 border-green-400">
				<span className="material-icons-round text-green-500 text-7xl mb-4 animate-bounce">check_circle</span>
				<h1 className="text-3xl font-extrabold mb-2 text-green-700 dark:text-green-300 text-center">¡Pago realizado con éxito!</h1>
				<p className="text-lg text-slate-700 dark:text-white/80 mb-6 text-center">Tu orden ha sido registrada correctamente.<br />Puedes ver el detalle en la sección de órdenes.</p>
				<Link href="/home/ordenes" className="mt-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg text-lg transition">Ver mis órdenes</Link>
				<Link href="/home/products-by-category" className="mt-4 px-8 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow text-base transition">Seguir comprando</Link>
			</div>
		</div>
	);
}
