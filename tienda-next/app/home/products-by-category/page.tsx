"use client";
import { useSearchParams } from "next/navigation";
import ProductoCard from "../../components/ProductoCard";
import { useEffect, useState, useMemo, useCallback } from "react";
import { obtenerProductos } from "../../lib/productos-db";

export default function ProductsByCategoryPage() {
  const searchParams = useSearchParams();
  const categoria = searchParams.get("cat") || searchParams.get("category") || "";
  const subcategoria = searchParams.get("subcat") || searchParams.get("subcategory") || "";
  const subsubcategoria = searchParams.get("subsubcat") || searchParams.get("subsubcategory") || "";

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("newest");
  const [showPrecio, setShowPrecio] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Fetch productos ───────────────────────────────
  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      const prods = await obtenerProductos();
      setProductos(prods);
      setLoading(false);
    }
    fetchProductos();
  }, [categoria, subcategoria, subsubcategoria]);

  // ── Chequear autenticación ───────────────────────
  useEffect(() => {
    // Reemplaza con tu lógica real de autenticación
    const loggedIn = Boolean(localStorage.getItem("token"));
    setIsAuthenticated(loggedIn);
  }, []);

  // ── Filtrado y orden ─────────────────────────────
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
        if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
        return 0;
      });
  }, [productos, categoria, subcategoria, subsubcategoria, search, precioMin, precioMax, orden]);

  const hasFilters = !!(search || precioMin || precioMax || orden !== "newest");

  const clearFilters = useCallback(() => {
    setSearch("");
    setPrecioMin("");
    setPrecioMax("");
    setOrden("newest");
  }, []);

  const ordenOpciones = [
    { value: "newest",     label: "Más nuevos"    },
    { value: "price-low",  label: "Menor precio"  },
    { value: "price-high", label: "Mayor precio"  },
  ];

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

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-5 py-10 flex-1">

        {/* ── Cabecera ─────────────────────────────────────────── */}
        {(categoria || subcategoria) && (
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight"></h1>
            {subcategoria && categoria && (
              <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">
                {categoria}{subsubcategoria ? ` › ${subsubcategoria}` : ""}
              </p>
            )}
          </div>
        )}

        {/* ── Filtros horizontales ─────────────────────────────── */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-6 sm:py-15 mb-5 space-y-3">

          {/* Fila 1: buscador + precio + limpiar */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
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
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white/80"
                >
                  <span className="material-icons-round text-[15px]">close</span>
                </button>
              )}
            </div>

            {/* Toggle precio */}
            <button
              onClick={() => setShowPrecio((v) => !v)}
              className={chip(showPrecio || !!(precioMin || precioMax))}
            >
              <span className="material-icons-round text-[15px]">attach_money</span>
              Precio
              {(precioMin || precioMax) && !showPrecio && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300" />
              )}
            </button>

            {/* Limpiar */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all whitespace-nowrap"
              >
                <span className="material-icons-round text-[14px]">close</span>
                Limpiar
              </button>
            )}
          </div>

          {/* Precio expandible */}
          {showPrecio && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-white/40 font-medium">Rango:</span>
              <input
                type="number"
                placeholder="Mín"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                min={0}
                className={`${inputCls} w-24`}
              />
              <span className="text-slate-300 dark:text-white/20">—</span>
              <input
                type="number"
                placeholder="Máx"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                min={0}
                className={`${inputCls} w-24`}
              />
            </div>
          )}

          {/* Fila 2: orden + conteo */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 dark:text-white/30 font-medium">Ordenar:</span>
            {ordenOpciones.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOrden(opt.value)}
                className={chip(orden === opt.value)}
              >
                {opt.label}
              </button>
            ))}
            {!loading && (
              <span className="ml-auto text-xs text-slate-400 dark:text-white/75 tabular-nums">
                {productosFiltrados.length}{" "}
                {productosFiltrados.length === 1 ? "resultado" : "resultados"}
              </span>
            )}
          </div>
        </div>

        {/* ── Grid de productos ─────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 h-60 animate-pulse"
              />
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <span className="material-icons-round text-3xl text-slate-300 dark:text-white/20">
                search_off
              </span>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-white/80">Sin resultados</p>
              <p className="text-sm text-slate-400 dark:text-white/30 mt-1 max-w-[240px]">
                Prueba otros términos o ajusta los filtros de precio
              </p>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-500 dark:text-purple-400 underline underline-offset-2"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {productosFiltrados.map((p: any) => (
              <ProductoCard
                key={p.id}
                producto={p}
                showCart
                showEye
                showFav={isAuthenticated} // ← ahora sí coincide con el prop
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}