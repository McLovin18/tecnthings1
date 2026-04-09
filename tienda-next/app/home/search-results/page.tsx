"use client"

import ProductoCard from "../../components/ProductoCard";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { obtenerProductos } from "../../lib/productos-db";

export default function SearchResultsPage() {
  const [productos, setProductos] = useState([]);
  const [orden, setOrden] = useState("price-high");
  const [marca, setMarca] = useState("");
  const [marcas, setMarcas] = useState([]);
  const searchParams = useSearchParams();
  const query = searchParams?.get("query") || "";

  useEffect(() => {
    obtenerProductos().then(prods => {
      setProductos(prods);
      // Extraer marcas únicas
      const marcasUnicas = Array.from(new Set(prods.map(p => p.marca).filter(Boolean)));
      setMarcas(marcasUnicas);
    });
  }, []);

  // Filtros
  let productosFiltrados = productos.filter(p => {
    const texto = query.trim().toLowerCase();
    if (!texto) return false; // Si no hay query, no mostrar nada
    const nombre = p.nombre?.toLowerCase() || "";
    const marcaProd = p.marca?.toLowerCase() || "";
    const categoria = p.categoria?.toLowerCase() || "";
    const subcategoria = p.subcategoria?.toLowerCase() || "";
    const subsubcategoria = p.subsubcategoria?.toLowerCase() || "";
    const coincideTexto = nombre.includes(texto) || marcaProd.includes(texto) || categoria.includes(texto) || subcategoria.includes(texto) || subsubcategoria.includes(texto);
    const coincideMarca = !marca || p.marca === marca;
    return coincideTexto && coincideMarca;
  });

    // --- Paginación responsive: 10 productos en móvil, cols*3 en desktop ---
    const [currentPage, setCurrentPage] = useState(1);
    const getProductsPerPage = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) return 10; // móvil
        if (window.innerWidth >= 1024) return 4 * 3; // lg: 4 cols x 3 filas
        if (window.innerWidth >= 768) return 3 * 3; // md: 3 cols x 3 filas
        if (window.innerWidth >= 640) return 2 * 3; // sm: 2 cols x 3 filas
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




  if (orden === "price-low") productosFiltrados = productosFiltrados.sort((a, b) => a.precio - b.precio);
  if (orden === "price-high") productosFiltrados = productosFiltrados.sort((a, b) => b.precio - a.precio);

  return (
    <main className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white px-4 lg:px-6 py-8 flex-1">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 text-xs text-slate-500 dark:text-white/50 select-none">
        <a href="/" className="hover:underline">Inicio</a>
        <span>/</span>
        <span className="font-semibold text-accent">Búsqueda</span>
      </nav>
      {/* Filtros y opciones */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#3a1859] dark:text-white">Resultados de búsqueda</h1>
          <input
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full mt-2"
            placeholder="Buscar productos..."
            value={query}
            readOnly
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <select className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" value={orden} onChange={e => setOrden(e.target.value)}>
            <option value="newest">Más Nuevos</option>
            <option value="price-low">Menor Precio</option>
            <option value="price-high">Mayor Precio</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" value={marca} onChange={e => setMarca(e.target.value)}>
            <option value="">Todas las marcas</option>
            {marcas.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      {/* Grid de productos y estados */}
      {productosFiltrados.length === 0 ? (
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in duration-700">
            {paginatedProducts.map((p: any) => (
              <ProductoCard
                key={p.id}
                producto={p}
                showCart
                showEye
              />
            ))}
          </div>
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-8 select-none w-full">
              <button
                className="px-3 py-1.5 rounded border text-xs font-medium bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300 transition-all disabled:opacity-40"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`px-3 py-1.5 rounded border text-xs font-medium transition-all ${currentPage === n ? 'bg-[#7b68ee] border-purple-600 text-white shadow-sm' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300'}`}
                  onClick={() => setCurrentPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="px-3 py-1.5 rounded border text-xs font-medium bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300 transition-all disabled:opacity-40"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
