"use client";
import ProductoCard from "../components/ProductoCard";
import { useEffect, useState, useMemo, useCallback } from "react";
import type { Producto } from "../lib/productos-db";
import { parseCategorySlug } from "../lib/slug";

interface CategoryPageClientProps {
  productos: any[];
  categoriaId: string;
  subcategoriaId: string;
  subsubcategoriaId: string;
  slug: string;
  categoriaNombre?: string;
  subcategoriaNombre?: string;
  subsubcategoriaNombre?: string;
}

export default function CategoryPageClient({ productos, categoriaId, subcategoriaId, subsubcategoriaId, slug, categoriaNombre, subcategoriaNombre, subsubcategoriaNombre }: CategoryPageClientProps) {
  const [search, setSearch] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("price-low");
  const [showPrecio, setShowPrecio] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [slugArray, setSlugArray] = useState<string[]>([]);

  useEffect(() => {
    setSlugArray(slug.split('/'));
  }, [slug]);

  // Chequear autenticación
  useEffect(() => {
    const loggedIn = Boolean(localStorage.getItem("token"));
    setIsAuthenticated(loggedIn);
  }, []);

  // Filtrado y orden
  const productosFiltrados = useMemo(() => {
    const filtered = productos
      .filter((p: any) => {
        // Solo filtrar por búsqueda y precio, ya que la base de datos ya filtró por categoría/subcategoría
        const texto = search.toLowerCase().trim();
        const matchTexto =
          !texto ||
          (p.nombre?.toLowerCase() || "").includes(texto) ||
          (p.descripcion?.toLowerCase() || "").includes(texto);

        const basePrice = Number(p.precio || 0);
        const min = precioMin ? parseFloat(precioMin) : null;
        const max = precioMax ? parseFloat(precioMax) : null;
        const matchMin = min === null || basePrice >= min;
        const matchMax = max === null || basePrice <= max;

        return matchTexto && matchMin && matchMax;
      })
      .sort((a: any, b: any) => {
        const basePrice = (p: any) => Number(p.precio || 0);
        if (orden === "price-low") return basePrice(a) - basePrice(b);
        if (orden === "price-high") return basePrice(b) - basePrice(a);
        if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
        return 0;
      });
    
    return filtered;
  }, [productos, search, precioMin, precioMax, orden]);

  // Paginación responsive
  const [currentPage, setCurrentPage] = useState(1);
  const getProductsPerPage = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 10;
      if (window.innerWidth >= 1024) return 4 * 3;
      if (window.innerWidth >= 768) return 3 * 3;
      if (window.innerWidth >= 640) return 2 * 3;
    }
    return 10;
  };
  const [productsPerPage, setProductsPerPage] = useState(getProductsPerPage());
  useEffect(() => {
    function handleResize() {
      setProductsPerPage(getProductsPerPage());
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const totalPages = Math.ceil(productosFiltrados.length / productsPerPage);
  const paginatedProducts = productosFiltrados.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

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
        ? "bg-[#7b68ee] border-purple-600 text-white shadow-sm"
        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300"
    }`;

  const inputCls =
    "px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all";

  return (
    <div className="min-h-screen flex flex-col mt-2 bg-white dark:bg-black text-slate-900 dark:text-white transition-colors">
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-5 py-10 flex-1">
        {/* Cabecera */}
        {(categoriaId || subcategoriaId || subsubcategoriaId) && (
          <div className="mb-4">
            <nav className="flex items-center gap-1 text-xs text-slate-400 dark:text-white/30 mb-1 select-none">
              <span className="hover:underline cursor-pointer" onClick={() => window.location.href = '/'}>Categorías</span>
              {categoriaId && slugArray[0] && (
                <>
                  <span className="mx-1">›</span>
                  <span className="hover:underline cursor-pointer" onClick={() => window.location.href = `/${slugArray[0]}`}>{categoriaNombre || slugArray[0]}</span>
                </>
              )}
              {subcategoriaId && slugArray[1] && (
                <>
                  <span className="mx-1">›</span>
                  <span className="hover:underline cursor-pointer" onClick={() => window.location.href = `/${slugArray.slice(0, 2).join('/')}`}>{subcategoriaNombre || slugArray[1]}</span>
                </>
              )}
              {subsubcategoriaId && slugArray[2] && (
                <>
                  <span className="mx-1">›</span>
                  <span className="font-semibold text-slate-600 dark:text-white/80">{subsubcategoriaNombre || slugArray[2]}</span>
                </>
              )}
            </nav>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">
              {subsubcategoriaNombre || subcategoriaNombre || categoriaNombre}
            </h1>
          </div>
        )}

        {/* Filtros horizontales */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-6 sm:py-15 mb-5 space-y-3">
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
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white/80"
                >
                  <span className="material-icons-round text-[15px]">close</span>
                </button>
              )}
            </div>
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
            <span className="ml-auto text-xs text-slate-400 dark:text-white/75 tabular-nums">
              {productosFiltrados.length}{" "}
              {productosFiltrados.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>
        </div>

        {/* Grid de productos */}
        {productosFiltrados.length === 0 ? (
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
          <>
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in duration-700`}>
              {paginatedProducts.map((p: any) => (
                <ProductoCard
                  key={p.id}
                  producto={p}
                  showCart
                  showEye
                  showFav={isAuthenticated}
                />
              ))}
            </div>
            {/* Paginación compacta */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-1 mt-8 select-none w-full">
                <button
                  className="px-2 py-1.5 rounded border text-xs font-medium bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300 transition-all disabled:opacity-40"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  &lt;&lt;
                </button>
                <button
                  className="px-2 py-1.5 rounded border text-xs font-medium bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300 transition-all disabled:opacity-40"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <div className="flex gap-1">
                  {currentPage > 1 && (
                    <button
                      className="px-2 py-1.5 rounded border text-xs font-medium bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300 transition-all"
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      {currentPage - 1}
                    </button>
                  )}
                  <button className="px-2 py-1.5 rounded border text-xs font-medium bg-[#7b68ee] border-purple-600 text-white shadow-sm">
                    {currentPage}
                  </button>
                  {currentPage < totalPages && (
                    <button
                      className="px-2 py-1.5 rounded border text-xs font-medium bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300 transition-all"
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      {currentPage + 1}
                    </button>
                  )}
                </div>
                <button
                  className="px-2 py-1.5 rounded border text-xs font-medium bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300 transition-all disabled:opacity-40"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
                <button
                  className="px-2 py-1.5 rounded border text-xs font-medium bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300 transition-all disabled:opacity-40"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  &gt;&gt;
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
