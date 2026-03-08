
"use client";
import { useSearchParams } from "next/navigation";
import ProductoCard from "../components/ProductoCard";
import { useEffect, useState } from "react";
import { obtenerProductos } from "../lib/productos-db";

import CategoriesBar from "../components/CategoriesBar";

export default function ProductsByCategoryPage() {
  // Obtener los parámetros desde la URL usando el hook de Next.js
  const searchParams = useSearchParams();
  const categoria = searchParams.get("cat") || searchParams.get("category") || "";
  const subcategoria = searchParams.get("subcat") || searchParams.get("subcategory") || "";
  const subsubcategoria = searchParams.get("subsubcat") || searchParams.get("subsubcategory") || "";
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para filtros y búsqueda
  const [search, setSearch] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("newest");

  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      // Trae todos los productos y filtra en el cliente por los parámetros
      const prods = await obtenerProductos();
      setProductos(prods);
      setLoading(false);
    }
    fetchProductos();
  }, [categoria, subcategoria, subsubcategoria]);

  // Filtrado y ordenamiento de productos
  const productosFiltrados = productos
    .filter((p) => {
      // Filtro por categoría, subcategoría o subsubcategoría
      let matchCategoria = true;
      if (categoria) matchCategoria = p.categoria === categoria;
      if (subcategoria) matchCategoria = matchCategoria && p.subcategoria === subcategoria;
      if (subsubcategoria) matchCategoria = matchCategoria && p.subsubcategoria === subsubcategoria;

      // Búsqueda por nombre o descripción
      const texto = search.trim().toLowerCase();
      const nombre = p.nombre?.toLowerCase() || "";
      const desc = p.descripcion?.toLowerCase() || "";
      const matchTexto = !texto || nombre.includes(texto) || desc.includes(texto);
      // Filtro por rango de precio
      const min = precioMin ? parseFloat(precioMin) : null;
      const max = precioMax ? parseFloat(precioMax) : null;
      const matchMin = min === null || p.precio >= min;
      const matchMax = max === null || p.precio <= max;
      return matchCategoria && matchTexto && matchMin && matchMax;
    })
    .sort((a, b) => {
      if (orden === "price-low") return a.precio - b.precio;
      if (orden === "price-high") return b.precio - a.precio;
      // Por defecto, más nuevos (por id, si hay timestamp usar ese)
      if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
      return 0;
    });

  return (
    <div
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
      className="min-h-screen flex flex-col mt-2"
    >
      <CategoriesBar />
      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-6 pb-24 lg:pb-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR FILTROS */}
          <aside className="lg:col-span-1">
            <div className="rounded-lg p-6 space-y-6 sticky top-20 bg-white text-slate-900 dark:bg-[#3a1859] dark:text-white">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full mb-2"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <input
                type="number"
                placeholder="Precio mínimo"
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full mb-2"
                value={precioMin}
                onChange={e => setPrecioMin(e.target.value)}
                min={0}
              />
              <input
                type="number"
                placeholder="Precio máximo"
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full mb-2"
                value={precioMax}
                onChange={e => setPrecioMax(e.target.value)}
                min={0}
              />
              <select
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full"
                value={orden}
                onChange={e => setOrden(e.target.value)}
              >
                <option value="newest">Más Nuevos</option>
                <option value="price-low">Menor Precio</option>
                <option value="price-high">Mayor Precio</option>
              </select>
            </div>
          </aside>
          {/* PRODUCTOS */}
          <section className="lg:col-span-3">
            <h2 className="text-2xl font-bold mb-6 text-purple-700">Productos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="text-slate-500 col-span-full">Cargando productos...</div>
              ) : productosFiltrados.length === 0 ? (
                <div className="text-slate-500 col-span-full">No se encontraron productos.</div>
              ) : productosFiltrados.map((p) => (
                <ProductoCard key={p.id} producto={p} showCart={true} showEye={true} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
