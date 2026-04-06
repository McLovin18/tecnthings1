"use client";
import BottomBarPublic from "../components/BottomBarPublic";
import { useUser } from "../context/UserContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ProductoCard from "../components/ProductoCard";
import { Loading3DIcon } from "../components/Loading3DIcon";
import { obtenerProductos } from "../lib/productos-db";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams?.get("query") || "";
  const isLogger = useUser();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(queryParam);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("newest");
  const [marca, setMarca] = useState("");
  const [marcas, setMarcas] = useState([]);

  // 🔥 Cargar productos
  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      const prods = await obtenerProductos();
      setProductos(prods);
      setLoading(false);
      const marcasUnicas = Array.from(new Set(prods.map(p => p.marca).filter(Boolean)));
      setMarcas(marcasUnicas);
    }
    fetchProductos();
  }, []);

  // 🔥 Filtrado
  const productosFiltrados = useMemo(() => {
    return productos
      .filter(p => {
        const texto = search.toLowerCase().trim();
        const nombre = p.nombre?.toLowerCase() || "";
        const desc = p.descripcion?.toLowerCase() || "";
        const marcaProd = p.marca?.toLowerCase() || "";
        const categoria = p.categoria?.toLowerCase() || "";
        const subcategoria = p.subcategoria?.toLowerCase() || "";
        const subsubcategoria = p.subsubcategoria?.toLowerCase() || "";

        const coincideTexto =
          !texto ||
          nombre.includes(texto) ||
          desc.includes(texto) ||
          marcaProd.includes(texto) ||
          categoria.includes(texto) ||
          subcategoria.includes(texto) ||
          subsubcategoria.includes(texto);

        const coincideMarca = !marca || p.marca === marca;

        const basePrice = Number(p.precio || 0);
        const discount = Number(p.descuento || 0);
        const finalPrice = discount > 0 && discount < 100 ? basePrice * (1 - discount / 100) : basePrice;

        const min = precioMin ? parseFloat(precioMin) : null;
        const max = precioMax ? parseFloat(precioMax) : null;
        const matchMin = min === null || finalPrice >= min;
        const matchMax = max === null || finalPrice <= max;

        return coincideTexto && coincideMarca && matchMin && matchMax;
      })
      .sort((a, b) => {
        const getFinalPrice = (p: any) => {
          const base = Number(p.precio || 0);
          const disc = Number(p.descuento || 0);
          return disc > 0 && disc < 100 ? base * (1 - disc / 100) : base;
        };
        if (orden === "price-low") return getFinalPrice(a) - getFinalPrice(b);
        if (orden === "price-high") return getFinalPrice(b) - getFinalPrice(a);
        if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
        return 0;
      });
  }, [productos, search, precioMin, precioMax, orden, marca]);

  const hasFilters = search || precioMin || precioMax || marca || orden !== "newest";
  const clearFilters = useCallback(() => {
    setSearch("");
    setPrecioMin("");
    setPrecioMax("");
    setMarca("");
    setOrden("newest");
  }, []);

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/20 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all";

  // 🔥 FilterPanel memoizado para no perder foco
  const FilterPanel = useMemo(() => (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold mb-2 block text-slate-700 dark:text-white">Buscar</label>
        <input
          type="text"
          placeholder="Nombre, descripción o categoría..."
          className={inputClass}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs font-semibold mb-2 block text-slate-700 dark:text-white">Rango de precio</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Mín"
            className={inputClass}
            value={precioMin}
            onChange={e => setPrecioMin(e.target.value)}
          />
          <input
            type="number"
            placeholder="Máx"
            className={inputClass}
            value={precioMax}
            onChange={e => setPrecioMax(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold mb-2 block text-slate-700 dark:text-white">Marca</label>
        <select className={inputClass} value={marca} onChange={e => setMarca(e.target.value)}>
          <option value="">Todas las marcas</option>
          {marcas.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold mb-2 block text-slate-700 dark:text-white">Ordenar</label>
        <select className={inputClass} value={orden} onChange={e => setOrden(e.target.value)}>
          <option value="newest">Más nuevos</option>
          <option value="price-low">Menor precio</option>
          <option value="price-high">Mayor precio</option>
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2 rounded-xl text-sm text-red-500 border border-red-300 dark:border-red-500"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  ), [search, precioMin, precioMax, marca, orden, hasFilters, clearFilters]);

  return (
    <div className="min-h-screen flex flex-col mt-2 dark:bg-black">
      <BottomBarPublic/>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 sm:py-15 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">{FilterPanel}</aside>

          <section className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loading3DIcon />
              </div>
            ) : productosFiltrados.length === 0 ? (
              <p className="text-slate-700 dark:text-white/50">No hay resultados</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {productosFiltrados.map(p => (
                  <ProductoCard key={p.id} producto={p} showCart showEye showFav />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}