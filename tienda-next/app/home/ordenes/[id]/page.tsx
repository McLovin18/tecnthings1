"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { obtenerOrdenPorId } from "../../../lib/ordenes-db";
import type { Timestamp } from "firebase/firestore";

interface OrdenProducto {
  id: string;
  nombre: string;
  cantidad: number;
  precio?: number;
  precioBase?: number;
  descuento?: number;
  precioUnitario?: number;
  subtotal?: number;
}

interface OrdenDetalle {
  id: string;
  orderId?: string;
  userId?: string;
  productos: OrdenProducto[];
  total: number;
  estado: string;
  motivoRechazo?: string;
  visitaFecha?: string;
  visitaHora?: string;
  createdAt?: Timestamp & { toDate?: () => Date };
}

export default function OrdenDetallePage() {
  const params = useParams<{ id: string }>();
  const [orden, setOrden] = useState<OrdenDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      setLoading(true);
      const data = await obtenerOrdenPorId(params.id as string);
      setOrden(data as any);
      setLoading(false);
    }
    load();
  }, [params?.id]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white">
        Cargando orden...
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white">
        Orden no encontrada.
      </div>
    );
  }

  const creada = orden.createdAt?.toDate ? orden.createdAt.toDate().toLocaleString() : "";

  const calcularPrecioUnitario = (p: OrdenProducto) => {
    const basePrice = p.precioBase !== undefined ? Number(p.precioBase || 0) : Number(p.precio || 0);
    const discount = Number(p.descuento || 0);
    const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
    if (p.precioUnitario !== undefined) return Number(p.precioUnitario || 0);
    return hasDiscount ? basePrice * (1 - discount / 100) : basePrice;
  };

  const calcularSubtotal = (p: OrdenProducto) => {
    if (p.subtotal !== undefined) return Number(p.subtotal || 0);
    const unit = calcularPrecioUnitario(p);
    const cantidad = Number(p.cantidad || 0);
    return unit * cantidad;
  };

  const calcularTotalOrden = (o: OrdenDetalle) => {
    if (typeof o.total === "number") return o.total;
    return (o.productos || []).reduce((sum, p) => sum + calcularSubtotal(p), 0);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white p-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow p-6 print:shadow-none print:border print:border-slate-300">
        <h1 className="text-2xl font-bold mb-2">Orden {orden.orderId || `#${orden.id.slice(-6)}`}</h1>
        <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">Creada: {creada}</div>
        <div className="mb-4 text-xs text-slate-600 dark:text-slate-300 print:text-[10px]">
          Presenta este documento con el ID de orden en el local para que el equipo verifique los productos y registre el pago. La orden se considera completada cuando su estado sea <span className="font-semibold">aprobada</span>.
        </div>
        {orden.visitaFecha && (
          <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
            Visita al local: {orden.visitaFecha} {orden.visitaHora || ""}
          </div>
        )}
        <div className="mb-4 text-sm">
          <span className="font-semibold">Estado:</span> {orden.estado}
        </div>
        {orden.motivoRechazo && orden.estado === "rechazada" && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400">
            Motivo del rechazo: {orden.motivoRechazo}
          </div>
        )}
        <h2 className="text-lg font-semibold mb-2">Productos</h2>
        <table className="w-full text-sm mb-4 border-t border-b border-slate-200 dark:border-slate-600">
          <thead>
            <tr className="text-left">
              <th className="py-2">Producto</th>
              <th className="py-2">Cantidad</th>
              <th className="py-2 text-right">Precio unit.</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orden.productos.map((p, idx) => (
              <tr key={idx} className="border-t border-slate-100 dark:border-slate-700">
                <td className="py-1 pr-2">{p.nombre}</td>
                <td className="py-1 pr-2">{p.cantidad}</td>
                <td className="py-1 pr-2 text-right">
                  {(() => {
                    const base = p.precioBase !== undefined ? Number(p.precioBase || 0) : Number(p.precio || 0);
                    const discount = Number(p.descuento || 0);
                    const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
                    const unit = calcularPrecioUnitario(p);
                    if (hasDiscount) {
                      return (
                        <span>
                          <span className="block text-xs text-slate-400 line-through">${base.toFixed(2)}</span>
                          <span className="block text-sm font-semibold">${unit.toFixed(2)}</span>
                          <span className="block text-[10px] text-red-600">-{discount}%</span>
                        </span>
                      );
                    }
                    return <span>${unit.toFixed(2)}</span>;
                  })()}
                </td>
                <td className="py-1 text-right">
                  ${calcularSubtotal(p).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right font-bold text-lg mb-4">
          Total: ${calcularTotalOrden(orden).toFixed(2)}
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 print:hidden"
          >
            Imprimir / Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
