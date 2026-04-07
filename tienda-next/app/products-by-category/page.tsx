"use client";
import BottomBarPublic from "../components/BottomBarPublic";
import { useSearchParams } from "next/navigation";
import ProductoCard from "../components/ProductoCard";
import { Loading3DIcon } from "../components/Loading3DIcon";
import { useEffect, useState, useMemo, useCallback } from "react";
import { obtenerProductos } from "../lib/productos-db";
import { useUser } from "../context/UserContext";

export default function ProductsByCategoryPage() {
  const isLogged = useUser();
  const searchParams = useSearchParams();
  const categoria = searchParams.get("cat") || searchParams.get("category") || "";
  const subcategoria = searchParams.get("subcat") || searchParams.get("subcategory") || "";
  const subsubcategoria = searchParams.get("subsubcat") || searchParams.get("subsubcategory") || "";

  // --- Estados de datos ---
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false); // <--- NUEVO: Para evitar parpadeo de hidratación

  // --- Estados de filtros ---
  const [search, setSearch] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("price-high");
  const [showPrecio, setShowPrecio] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 1. Control de Montaje (Evita saltos de Dark Mode e Iconos iniciales)
  useEffect(() => {
    setIsMounted(true);
    const loggedIn = Boolean(localStorage.getItem("token"));
    setIsAuthenticated(loggedIn);
  }, []);

  // 2. Fetch productos
  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      try {
        const prods = await obtenerProductos();
        setProductos(prods || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProductos();
  }, [categoria, subcategoria, subsubcategoria]);

  // 3. Filtrado y orden (Memoizado)
  const productosFiltrados = useMemo(() => {
    return productos
      .filter((p: any) => {
        let matchCategoria = true;
        if (categoria) matchCategoria = p.categoria === categoria;
        if (subcategoria) matchCategoria = matchCategoria && p.subcategoria === subcategoria;
        if (subsubcategoria) matchCategoria = matchCategoria && p.subsubcategoria === subsubcategoria;

        const texto = search.toLowerCase().trim();
        const matchTexto =
          !texto ||
          (p.nombre?.toLowerCase() || "").includes(texto) ||
          (p.descripcion?.toLowerCase() || "").includes(texto);

        const base = Number(p.precio || 0);
        const disc = Number(p.descuento || 0);
        const finalPrice = disc > 0 && disc < 100 ? base * (1 - disc / 100) : base;
        const min = precioMin ? parseFloat(precioMin) : null;
        const max = precioMax ? parseFloat(precioMax) : null;
        const matchMin = min === null || finalPrice >= min;
        const matchMax = max === null || finalPrice <= max;

        return matchCategoria && matchTexto && matchMin && matchMax;
      })
      .sort((a: any, b: any) => {
        const fp = (p: any) => {
          const base = Number(p.precio || 0);
          const d = Number(p.descuento || 0);
          return d > 0 && d < 100 ? base * (1 - d / 100) : base;
        };
        if (orden === "price-low") return fp(a) - fp(b);
        if (orden === "price-high") return fp(b) - fp(a);
        return (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0);
      });
  }, [productos, categoria, subcategoria, subsubcategoria, search, precioMin, precioMax, orden]);

  const hasFilters = !!(search || precioMin || precioMax || orden !== "newest");

  const clearFilters = useCallback(() => {
    setSearch("");
    setPrecioMin("");
    setPrecioMax("");
    setOrden("newest");
  }, []);

  // --- Helpers de Estilo ---
  const chip = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer select-none whitespace-nowrap ${
      active
        ? "bg-purple-600 border-purple-600 text-white shadow-sm"
        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300"
    }`;

  const inputCls =
    "px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all";

  return (
    <div className="min-h-screen flex flex-col mt-2 bg-white dark:bg-black text-slate-900 dark:text-white transition-colors">
        <BottomBarPublic />


      <main className="max-w-7xl mx-auto w-full px-3 sm:px-5 py-8 flex-1">
        {/* Cabecera */}
        {(categoria || subcategoria) && (
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight"></h1>
            {subcategoria && categoria && (
              <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5 uppercase tracking-wider">
                {categoria} {subsubcategoria ? ` › ${subsubcategoria}` : ""}
              </p>
            )}
          </div>
        )}

        {/* Filtros horizontales */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 mb-5 space-y-3 shadow-sm">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[160px] max-w-sm">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 text-[17px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} w-full pl-9 pr-8`}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white/80">
                  <span className="material-icons-round text-[15px]">close</span>
                </button>
              )}
            </div>

            <button onClick={() => setShowPrecio((v) => !v)} className={chip(showPrecio || !!(precioMin || precioMax))}>
              <span className="material-icons-round text-[15px]">attach_money</span>
              Precio
            </button>

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
                <span className="material-icons-round text-[14px]">close</span>
                Limpiar
              </button>
            )}
          </div>

          {showPrecio && (
            <div className="flex items-center gap-2 flex-wrap pt-1 animate-in fade-in slide-in-from-top-1">
              <span className="text-xs text-slate-500 dark:text-white/40 font-medium">Rango:</span>
              <input type="number" placeholder="Mín" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} className={`${inputCls} w-24`} />
              <span className="text-slate-300 dark:text-white/20">—</span>
              <input type="number" placeholder="Máx" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} className={`${inputCls} w-24`} />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap border-t border-slate-100 dark:border-white/5 pt-3">
            <span className="text-xs text-slate-400 dark:text-white/30 font-medium">Ordenar:</span>
            {[
              { v: "newest", l: "Más nuevos" },
              { v: "price-low", l: "Menor precio" },
              { v: "price-high", l: "Mayor precio" }
            ].map((opt) => (
              <button key={opt.v} onClick={() => setOrden(opt.v)} className={chip(orden === opt.v)}>
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de productos o Loading */}
        {(!isMounted || loading) ? (
          <div className="flex flex-col items-center justify-center py-32 transition-opacity duration-500">
            <Loading3DIcon />
            <p className="text-xs text-slate-400 dark:text-white/20 mt-6 font-medium tracking-widest uppercase">Cargando catálogo</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <span className="material-icons-round text-3xl text-slate-300 dark:text-white/20">search_off</span>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-white/80">Sin resultados</p>
              <p className="text-sm text-slate-400 dark:text-white/30 mt-1 max-w-[240px]">Prueba otros términos o ajusta los filtros</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in duration-700">
            {productosFiltrados.map((p: any) => (
              <ProductoCard key={p.id} producto={p} showCart showEye showFavorite={isAuthenticated} />
            ))}
          </div>
        )}
      </main>
      
    </div>
    
  );
}