"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { obtenerOrdenesPorUsuario } from "../../lib/ordenes-db";

export default function OrdenesPage() {
  const { user } = useUser();
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrdenes() {
      if (!user?.uid) return;
      setLoading(true);
      const ords = await obtenerOrdenesPorUsuario(user.uid);
      // Ordenar: primero órdenes cuya visita es hoy, luego por fecha de visita
      const hoyStr = new Date().toISOString().split("T")[0];
      const ordenadas = [...ords].sort((a, b) => {
        const aHoy = a.visitaFecha === hoyStr ? 1 : 0;
        const bHoy = b.visitaFecha === hoyStr ? 1 : 0;
        if (aHoy !== bHoy) return bHoy - aHoy; // hoy primero
        const aKey = `${a.visitaFecha || ""} ${a.visitaHora || ""}`;
        const bKey = `${b.visitaFecha || ""} ${b.visitaHora || ""}`;
        return aKey.localeCompare(bKey);
      });
      setOrdenes(ordenadas);
      setLoading(false);
    }
    fetchOrdenes();
  }, [user]);

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

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white transition-colors py-8">
      <h1 className="text-3xl font-bold mb-4 text-[#3a1859] dark:text-white">Mis órdenes</h1>
      <div className="w-full max-w-2xl mb-6 text-sm bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 rounded-lg p-3">
        Para completar tu compra, acércate al local con el PDF de tu orden (ID como <span className="font-mono">ord-00001</span>). El equipo validará tu orden en el sistema y la marcará como <span className="font-semibold">aprobada</span> una vez realizado el pago.
      </div>
      {loading ? (
        <div className="text-lg text-[#3a1859] dark:text-white/80">Cargando órdenes...</div>
      ) : ordenes.length === 0 ? (
        <div className="text-lg text-[#3a1859] dark:text-white/80">No tienes órdenes registradas.</div>
      ) : (
        <div className="w-full max-w-2xl space-y-6">
          {ordenes.map((orden) => (
            <div key={orden.id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 border">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-lg">Orden {orden.orderId || `#${orden.id.slice(-6)}`}</div>
                <span className={`text-sm px-2 py-1 rounded font-semibold ${
                  orden.estado === "aprobada"
                    ? "bg-green-100 text-green-700"
                    : orden.estado === "rechazada"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {orden.estado}
                </span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                Creada: {orden.createdAt?.toDate ? orden.createdAt.toDate().toLocaleString() : ""}
              </div>
              {orden.visitaFecha && (
                <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  Visita al local: {orden.visitaFecha} {orden.visitaHora || ""}
                </div>
              )}
              <ul className="mb-2">
                {orden.productos.map((p, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{p.nombre} x{p.cantidad}</span>
                    <span>${calcularSubtotalProducto(p).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
                <div className="font-bold text-right mb-2">Total: ${calcularTotalOrden(orden).toFixed(2)}</div>
              {orden.motivoRechazo && orden.estado === "rechazada" && (
                <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Motivo del rechazo: {orden.motivoRechazo}
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <a
                  href={`/home/ordenes/${orden.id}`}
                  target="_blank"
                  className="text-sm px-3 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Descargar PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
