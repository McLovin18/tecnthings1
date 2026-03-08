"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { obtenerProductoPorId } from "../../lib/productos-db";
import { useSearchParams } from "next/navigation";

export default function ProductDetailPage({ params }) {
  const [producto, setProducto] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const { isLogged, isCliente, isAdmin, favoritos, addFavorito, removeFavorito, carrito, addCarrito, removeCarrito } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchProducto() {
      setLoading(true);
      const id = params?.id || searchParams.get("id");
      if (!id) {
        setProducto(null);
        setLoading(false);
        return;
      }
      const prod = await obtenerProductoPorId(id);
      setProducto(prod);
      setLoading(false);
    }
    fetchProducto();
  }, [params?.id, searchParams]);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8 text-center text-slate-500">Cargando producto...</div>;
  }
  if (!producto) {
    return <div className="max-w-4xl mx-auto p-8 text-center text-red-500">Producto no encontrado</div>;
  }

  const maxCantidad = producto.stock;
  const isFav = favoritos?.some((p) => p.id === producto.id);
  const inCart = carrito?.some((p) => p.id === producto.id);
  const basePrice = Number((producto as any).precio || 0);
  const discount = Number((producto as any).descuento || 0);
  const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
  const finalPrice = hasDiscount ? basePrice * (1 - discount / 100) : basePrice;

  // Añadir al carrito con cantidad
  const handleAddCart = () => {
    if (inCart) {
      removeCarrito(producto.id);
    } else {
      addCarrito({ ...producto, cantidad });
    }
  };
  // Favoritos
  const handleFav = () => {
    if (isFav) {
      removeFavorito(producto.id);
    } else {
      addFavorito(producto);
    }
  };

  return (
    <div className="min-h-screen flex flex-col  bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white transition-colors">
      <div className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-8">
        {/* Galería de imágenes */}
        <div className="flex-1 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-md">
            {hasDiscount && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                -{discount}%
              </span>
            )}
            <img
              src={producto.imagenes[imgIdx]}
              alt={producto.nombre}
              className="object-contain w-full h-full rounded-2xl shadow-lg"
            />
            {/* Flechas solo si hay más de una imagen */}
            {producto.imagenes.length > 1 && imgIdx > 0 && (
              <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white rounded-full p-2 shadow" onClick={() => setImgIdx(imgIdx - 1)}>
                <span className="material-icons-round">chevron_left</span>
              </button>
            )}
            {producto.imagenes.length > 1 && imgIdx < producto.imagenes.length - 1 && (
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white rounded-full p-2 shadow" onClick={() => setImgIdx(imgIdx + 1)}>
                <span className="material-icons-round">chevron_right</span>
              </button>
            )}
          </div>
          {/* Miniaturas */}
          {producto.imagenes.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {producto.imagenes.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="mini"
                className={`w-16 h-16 object-cover rounded-lg border-2 ${imgIdx === idx ? "border-purple-600" : "border-transparent"}`}
                onClick={() => setImgIdx(idx)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
        )}
        </div>
        {/* Info producto */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-3xl font-bold mb-1">{producto.nombre}</h1>
          <div className="text-xs text-slate-400 mb-3">SKU: {producto.sku || producto.id}</div>
          <div className="flex items-baseline gap-2 mb-4">
            {hasDiscount ? (
              <>
                <span className="text-base text-slate-400 line-through">${basePrice.toFixed(2)}</span>
                <span className="text-2xl font-bold text-purple-700">${finalPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-purple-700">${basePrice.toFixed(2)}</span>
            )}
          </div>
          <div className="mb-4 text-slate-700 dark:text-slate-200">{producto.descripcion}</div>
          {/* Stock y cantidad */}
          <div className="flex items-center gap-4 mb-4">
            <span className="font-bold">Stock:</span>
            <span className={producto.stock > 0 ? "text-green-600" : "text-red-600"}>{producto.stock > 0 ? producto.stock : "Sin stock"}</span>
          </div>
          {/* Campo cantidad y acciones */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <label className="font-bold">Cantidad:</label>
            <input
              type="number"
              min={1}
              max={maxCantidad}
              value={cantidad}
              onChange={e => setCantidad(Math.max(1, Math.min(maxCantidad, Number(e.target.value))))}
              className="input w-24 sm:w-20 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                className={`flex-1 sm:flex-none w-full sm:w-auto bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded-xl shadow-lg text-lg ${inCart ? "opacity-60" : ""}`}
                disabled={producto.stock === 0}
                onClick={handleAddCart}
              >{inCart ? "Quitar del carrito" : "Añadir al carrito"}</button>
              <button
                className={`bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg text-lg ${isFav ? "opacity-80" : ""}`}
                onClick={handleFav}
                title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                <span className="material-icons-round">{isFav ? "favorite" : "favorite_border"}</span>
              </button>
            </div>
          </div>
          {!isLogged && (
            <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
              Puedes comprar sin registrarte, pero <a href="/login?tab=register" className="underline font-semibold">regístrate e inicia sesión</a> para una mejor experiencia de compra.
            </div>
          )}
          {/* Si no logueado, botón de login */}
          // ...existing code...
          {/* Características */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">Características</h3>
            <ul className="list-disc pl-6 text-slate-700 dark:text-slate-200">
              {producto.caracteristicas.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
