"use client";

import { useEffect, useState } from "react";
import { obtenerTodasOrdenes, actualizarOrden } from "../../lib/ordenes-db";
import { obtenerProductoPorId } from "../../lib/productos-db";

export default function PedidosAdminPage() {
	const [ordenes, setOrdenes] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState<"pendientes" | "aprobadas">("pendientes");
	const [filtro, setFiltro] = useState("");
	const [clientesMap, setClientesMap] = useState<Record<string, { displayName: string | null; email: string | null }>>({});

	useEffect(() => {
		async function load() {
			setLoading(true);
			const [data, clientesRes] = await Promise.all([
				obtenerTodasOrdenes(),
				fetch("/api/admin/clientes").then((r) => r.ok ? r.json() : { clientes: [] }),
			]);
			setOrdenes(data);
			const map: Record<string, { displayName: string | null; email: string | null }> = {};
			for (const c of (clientesRes.clientes || [])) {
				map[c.uid] = { displayName: c.displayName, email: c.email };
			}
			setClientesMap(map);
			setLoading(false);
		}
		load();
	}, []);

	const calcularSubtotalProducto = (p: any) => {
		const cantidad = Number(p.cantidad || 0);
		if (p.subtotal !== undefined) {
			return Number(p.subtotal || 0);
		}
		const basePrice = p.precioBase !== undefined ? Number(p.precioBase || 0) : Number(p.precio || 0);
		const discount = Number(p.descuento || 0);
		const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
		const unitPrice = p.precioUnitario !== undefined
			? Number(p.precioUnitario || 0)
			: (hasDiscount ? basePrice * (1 - discount / 100) : basePrice);
		return unitPrice * cantidad;
	};

	const calcularTotalOrden = (orden: any) => {
		if (typeof orden.total === "number") return orden.total;
		return (orden.productos || []).reduce((sum: number, p: any) => sum + calcularSubtotalProducto(p), 0);
	};

	const ordenesFiltradas = ordenes.filter((o) => {
		if (tab === "pendientes" && o.estado !== "generada" && o.estado !== "pendiente_pago" && o.estado !== "pago_fallido") return false;
		if (tab === "aprobadas" && o.estado !== "aprobada") return false;
		if (!filtro.trim()) return true;
		const term = filtro.trim().toLowerCase();
		const clientInfo = o.userId ? clientesMap[o.userId] : null;
		return (
			(o.orderId || "").toLowerCase().includes(term) ||
			(o.userId || "").toLowerCase().includes(term) ||
			(o.guestEmail || "").toLowerCase().includes(term) ||
			(o.userEmail || "").toLowerCase().includes(term) ||
			(clientInfo?.displayName || "").toLowerCase().includes(term) ||
			(clientInfo?.email || "").toLowerCase().includes(term)
		);
	});

	const aprobarOrden = async (orden: any) => {
		if (orden.estado !== "generada") return;
		if (!confirm(`Aprobar la orden ${orden.orderId || orden.id}?`)) return;
		try {
			// Actualizar stock de cada producto al aprobar
			for (const p of orden.productos || []) {
				const prod = await obtenerProductoPorId(p.id);
				if (!prod) continue;
				const stockActual = typeof prod.stock === "string" ? parseInt(prod.stock) : prod.stock || 0;
				const cantidad = typeof p.cantidad === "string" ? parseInt(p.cantidad) : p.cantidad || 1;
				const nuevoStock = stockActual - cantidad;
				try {
					await fetch("/api/admin/update-stock", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ id: p.id, stock: nuevoStock }),
					});
				} catch (e) {
					console.error("Error al actualizar stock para producto", p.id, e);
				}
			}
			await actualizarOrden(orden.id, { estado: "aprobada" });
			setOrdenes((prev) => prev.map((o) => (o.id === orden.id ? { ...o, estado: "aprobada" } : o)));
		} catch (e) {
			console.error("Error al aprobar orden", e);
		}
	};

	const rechazarOrden = async (orden: any) => {
		if (orden.estado !== "generada") return;
		const motivo = window.prompt(`Motivo del rechazo para ${orden.orderId || orden.id}:`);
		if (!motivo) return;
		try {
			await actualizarOrden(orden.id, { estado: "rechazada", motivoRechazo: motivo });
			setOrdenes((prev) => prev.map((o) => (o.id === orden.id ? { ...o, estado: "rechazada", motivoRechazo: motivo } : o)));
		} catch (e) {
			console.error("Error al rechazar orden", e);
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white p-6">
			<h1 className="text-3xl font-bold mb-6">Gestión de órdenes</h1>
			<div className="flex flex-wrap items-center gap-4 mb-4">
				<div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
					<button
						className={`px-4 py-2 text-sm font-semibold ${tab === "pendientes" ? "bg-purple-600 text-white" : "bg-transparent"}`}
						onClick={() => setTab("pendientes")}
					>
						Órdenes en aprobación
					</button>
					<button
						className={`px-4 py-2 text-sm font-semibold ${tab === "aprobadas" ? "bg-purple-600 text-white" : "bg-transparent"}`}
						onClick={() => setTab("aprobadas")}
					>
						Órdenes aprobadas
					</button>
				</div>
				<input
					type="text"
				placeholder="Buscar por ID de orden, userId o correo..."
					value={filtro}
					onChange={(e) => setFiltro(e.target.value)}
					className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
				/>
			</div>
			{loading ? (
				<div>Cargando órdenes...</div>
			) : ordenesFiltradas.length === 0 ? (
				<div>No hay órdenes para este filtro.</div>
			) : (
				<div className="space-y-4">
					{ordenesFiltradas.map((orden) => (
						<div key={orden.id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 border">
						<div className="flex justify-between items-center mb-2 flex-wrap gap-2">
							<div className="font-bold text-lg flex items-center gap-2">
								{orden.orderId || `#${orden.id.slice(-6)}`}
								{orden.metodoPago === "stripe" && (
									<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 flex items-center gap-0.5">
										💳 Stripe
									</span>
								)}
							</div>
							<span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
								orden.estado === "generada" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" :
								orden.estado === "aprobada" ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" :
								orden.estado === "pendiente_pago" ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" :
								orden.estado === "pago_fallido" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" :
								"bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
							}`}>
								{orden.estado === "pendiente_pago" ? "⏳ Pago pendiente" :
								 orden.estado === "pago_fallido" ? "❌ Pago fallido" :
								 orden.estado === "generada" ? "✔ Generada" :
								 orden.estado === "aprobada" ? "✅ Aprobada" :
								 orden.estado}
								</span>
							</div>
							<div className="text-sm text-slate-600 dark:text-slate-300 mb-1">
								Creada: {orden.createdAt?.toDate ? orden.createdAt.toDate().toLocaleString() : ""}
							</div>
							<div className="text-sm text-slate-600 dark:text-slate-300 mb-1">
								{orden.userId
									? (() => {
											const info = clientesMap[orden.userId];
											const label = info?.displayName || info?.email || orden.userEmail || orden.guestEmail || orden.userId;
											const badge = orden.claimedFromGuest
												? <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold">Cliente registrado</span>
												: <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold">Cliente</span>;
											return <span className="inline-flex items-center gap-1">{badge}<span className="font-semibold">{label}</span></span>;
										})()
									: orden.guestEmail
										? <span className="inline-flex items-center gap-1">
												<span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-xs font-bold">Invitado</span>
												<span className="font-semibold">{orden.guestEmail}</span>
											</span>
										: <span className="text-xs text-slate-400">Cliente invitado</span>}
							</div>
							{orden.visitaFecha && (
								<div className="text-sm text-slate-600 dark:text-slate-300 mb-1">
									Visita: {orden.visitaFecha} {orden.visitaHora || ""}
								</div>
							)}
							<ul className="mt-2 text-sm mb-2">
								{(orden.productos || []).map((p: any, idx: number) => (
									<li key={idx} className="flex justify-between">
										<span>{p.nombre} x{p.cantidad}</span>
										<span>${calcularSubtotalProducto(p).toFixed(2)}</span>
									</li>
								))}
							</ul>
							<div className="font-bold text-right mb-2">Total: ${calcularTotalOrden(orden).toFixed(2)}</div>
							{orden.motivoRechazo && orden.estado === "rechazada" && (
								<div className="text-sm text-red-600 dark:text-red-400 mb-2">
									Motivo rechazo: {orden.motivoRechazo}
								</div>
							)}
							{orden.estado === "generada" && (
								<div className="mt-2 flex gap-3 justify-end">
									<button
										onClick={() => rechazarOrden(orden)}
										className="px-3 py-1 rounded border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm"
									>
										Rechazar
									</button>
									<button
										onClick={() => aprobarOrden(orden)}
										className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
									>
										Aprobar
									</button>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
