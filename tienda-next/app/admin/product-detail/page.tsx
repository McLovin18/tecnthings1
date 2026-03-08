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
    <div className="min-h-screen flex flex-col mt-2">
      <div className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-8">
        {/* Galería de imágenes */}
        <div className="flex-1 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-md">
            <img
              src={producto.imagenes[imgIdx]}
              alt={producto.nombre}
              className="object-contain w-full h-full rounded-2xl shadow-lg"
            />
            {/* Flechas solo si hay más de una imagen */}
            {producto.imagenes.length > 1 && imgIdx > 0 && (
              <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow" onClick={() => setImgIdx(imgIdx - 1)}>
                <span className="material-icons-round">chevron_left</span>
              </button>
            )}
            {producto.imagenes.length > 1 && imgIdx < producto.imagenes.length - 1 && (
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow" onClick={() => setImgIdx(imgIdx + 1)}>
                <span className="material-icons-round">chevron_right</span>
              </button>
            )}
          </div>
          {/* Miniaturas */}
          {producto.imagenes.length > 1 && (
            <div className="flex gap-2 mt-4">
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
          <div className="text-2xl font-bold text-purple-700 mb-4">${producto.precio}</div>
          <div className="mb-4 text-slate-700 dark:text-slate-200">{producto.descripcion}</div>
          {/* Stock y cantidad */}
          <div className="flex items-center gap-4 mb-4">
            <span className="font-bold">Stock:</span>
            <span className={producto.stock > 0 ? "text-green-600" : "text-red-600"}>{producto.stock > 0 ? producto.stock : "Sin stock"}</span>
          </div>
          {/* Campo cantidad y acciones */}
          {isLogged && (isCliente || isAdmin) && (
            <div className="flex items-center gap-4 mb-4">
              <label className="font-bold">Cantidad:</label>
              <input
                type="number"
                min={1}
                max={maxCantidad}
                value={cantidad}
                onChange={e => setCantidad(Math.max(1, Math.min(maxCantidad, Number(e.target.value))))}
                className="input w-20"
              />
              <button
                className={`bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded-xl shadow-lg text-lg ${inCart ? "opacity-60" : ""}`}
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
          )}
          {/* Si no logueado, botón de login */}
          {!isLogged && (
            <button
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded-xl shadow-lg text-lg"
              onClick={() => window.location.href = "/login"}
            >Iniciar sesión para comprar</button>
          )}
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
