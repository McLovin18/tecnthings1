
"use client";
import React, { useEffect, useState } from "react";
import ProductoCard from "../../components/ProductoCard";
import { obtenerProductos } from "../../lib/productos-db";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para filtros y búsqueda (se implementarán en los siguientes pasos)
  const [search, setSearch] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("newest");

  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      const prods = await obtenerProductos();
      setProductos(prods);
      setLoading(false);
    }
    fetchProductos();
  }, []);

  // Filtrado y ordenamiento de productos
  const productosFiltrados = productos
    .filter((p) => {
      const basePrice = Number((p as any).precio || 0);
      const discount = Number((p as any).descuento || 0);
      const effectivePrice = !isNaN(discount) && discount > 0 && discount < 100
        ? basePrice * (1 - discount / 100)
        : basePrice;
      // Búsqueda por nombre o descripción
      const texto = search.trim().toLowerCase();
      const nombre = p.nombre?.toLowerCase() || "";
      const desc = p.descripcion?.toLowerCase() || "";
      const matchTexto = !texto || nombre.includes(texto) || desc.includes(texto);
      // Filtro por rango de precio
      const min = precioMin ? parseFloat(precioMin) : null;
      const max = precioMax ? parseFloat(precioMax) : null;
      const matchMin = min === null || effectivePrice >= min;
      const matchMax = max === null || effectivePrice <= max;
      return matchTexto && matchMin && matchMax;
    })
    .sort((a, b) => {
      const aBase = Number((a as any).precio || 0);
      const aDesc = Number((a as any).descuento || 0);
      const aPrice = !isNaN(aDesc) && aDesc > 0 && aDesc < 100 ? aBase * (1 - aDesc / 100) : aBase;
      const bBase = Number((b as any).precio || 0);
      const bDesc = Number((b as any).descuento || 0);
      const bPrice = !isNaN(bDesc) && bDesc > 0 && bDesc < 100 ? bBase * (1 - bDesc / 100) : bBase;

      if (orden === "price-low") return aPrice - bPrice;
      if (orden === "price-high") return bPrice - aPrice;
      // Por defecto, más nuevos (por id, si hay timestamp usar ese)
      if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white transition-colors px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#3a1859] dark:text-white">Productos</h1>
      <div className="w-full max-w-6xl mx-auto">
        {/* Filtros y barra de búsqueda */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full md:w-72"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="number"
              placeholder="Precio mínimo"
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-28"
              value={precioMin}
              onChange={e => setPrecioMin(e.target.value)}
              min={0}
            />
            <input
              type="number"
              placeholder="Precio máximo"
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-28"
              value={precioMax}
              onChange={e => setPrecioMax(e.target.value)}
              min={0}
            />
            <select
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              value={orden}
              onChange={e => setOrden(e.target.value)}
            >
              <option value="newest">Más Nuevos</option>
              <option value="price-low">Menor Precio</option>
              <option value="price-high">Mayor Precio</option>
            </select>
          </div>
        </div>
        {/* Productos filtrados y ordenados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="text-slate-500 col-span-full">Cargando productos...</div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-slate-500 col-span-full">No hay productos que coincidan con los filtros</div>
          ) : (
            productosFiltrados.map((p) => (
              <ProductoCard key={p.id} producto={p} showCart={true} showEye={true} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
