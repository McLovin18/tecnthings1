"use client";
import React, { useEffect, useState } from "react";
import ProductoCard from "../components/ProductoCard";
import { obtenerProductos } from "../lib/productos-db";

export default function HomePage() {
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDestacados() {
      setLoading(true);
      const productos = await obtenerProductos();
      setProductosDestacados(productos.filter(p => p.destacado));
      setLoading(false);
    }
    fetchDestacados();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white transition-colors">
      <div className="w-full max-w-2xl mx-auto mt-10 mb-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-2 text-[#3a1859] dark:text-white">¡Bienvenido, cliente!</h2>
        <p className="text-lg md:text-xl mb-4 text-[#3a1859] dark:text-white/80">
          Accede a las mejores ofertas, productos exclusivos y tu panel personalizado.
        </p>
      </div>
      {/* Productos destacados */}
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold mb-6 text-purple-700">Productos destacados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="text-slate-500 col-span-full">Cargando productos...</div>
          ) : productosDestacados.length === 0 ? (
            <div className="text-slate-500 col-span-full">No hay productos destacados</div>
          ) : productosDestacados.map((p) => (
            <ProductoCard key={p.id} producto={p} showCart={true} showEye={true} />
          ))}
        </div>
      </div>
    </div>
  );
}