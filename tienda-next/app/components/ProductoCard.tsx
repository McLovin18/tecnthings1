"use client";

import React from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";

export default function ProductoCard({ producto, onClick, showCart = false, showEye = true, onAddCart, onEye, showFav = false }) {
  const { isLogged, isCliente, isAdmin, favoritos, addFavorito, removeFavorito, carrito, addCarrito, removeCarrito } = useUser();
  const router = useRouter();
  const isFav = favoritos?.some((p) => p.id === producto.id);
  const inCart = carrito?.some((p) => p.id === producto.id);
  const basePrice = Number((producto as any).precio || 0);
  const discount = Number((producto as any).descuento || 0);
  const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
  const finalPrice = hasDiscount ? basePrice * (1 - discount / 100) : basePrice;
  // Navegación al detalle según rol
  const goToDetail = (e) => {
    if (e) e.stopPropagation();
    // Prefer the /home detail when we're inside the home section
    let detailUrl = `/product-detail?id=${producto.id}`;
    try {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/home')) {
        detailUrl = `/home/product-detail?id=${producto.id}`;
      } else {
        if (isAdmin) detailUrl = `/admin/product-detail?id=${producto.id}`;
        if (isCliente) detailUrl = `/home/product-detail?id=${producto.id}`;
      }
    } catch (err) {
      if (isAdmin) detailUrl = `/admin/product-detail?id=${producto.id}`;
      if (isCliente) detailUrl = `/home/product-detail?id=${producto.id}`;
    }
    router.push(detailUrl);
  };
  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center cursor-pointer hover:shadow-xl transition group"
      onClick={onClick || goToDetail}
    >
      <div className="w-full aspect-square flex items-center justify-center mb-3 relative">
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
            -{discount}%
          </span>
        )}
        {producto.imagenes?.[0] && !producto.imagenes[0].startsWith('blob:') ? (
          <img
            src={producto.imagenes[0]}
            alt={producto.nombre}
            className="object-contain max-h-40 max-w-full rounded-xl group-hover:scale-105 transition"
            onError={e => { e.currentTarget.src = "/no-image.png"; }}
          />
        ) : (
          <img
            src="/no-image.png"
            alt="Sin imagen"
            className="object-contain max-h-40 max-w-full rounded-xl group-hover:scale-105 transition opacity-60"
          />
        )}
      </div>
      <div className="w-full text-center">
        <div className="font-bold text-lg mb-1 line-clamp-3 break-words" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '3.5em'}}>{producto.nombre}</div>
        {producto.marca && (
          <div className="text-xs text-green-700 font-semibold mb-1">{producto.marca}</div>
        )}
        <div className="flex items-center justify-center gap-2 mb-2">
          {hasDiscount ? (
            <>
              <span className="text-sm text-slate-400 line-through">${basePrice.toFixed(2)}</span>
              <span className="text-purple-700 font-bold text-xl">${finalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-purple-700 font-bold text-xl">${basePrice.toFixed(2)}</span>
          )}
          {isLogged && isCliente && showCart && (
            <button
              className={`ml-2 p-2 rounded-full ${inCart ? "bg-purple-300 text-purple-900" : "bg-purple-100 hover:bg-purple-200 text-purple-700"}`}
              onClick={e => {
                e.stopPropagation();
                if (inCart) {
                  removeCarrito(producto.id);
                } else {
                  addCarrito(producto);
                }
              }}
              title={inCart ? "Quitar del carrito" : "Agregar al carrito"}
            >
              <span className="material-icons-round">{inCart ? "remove_shopping_cart" : "shopping_bag"}</span>
            </button>
          )}
          {showEye && (
            <button
              className="ml-2 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
              onClick={onEye ? (e => { e.stopPropagation(); onEye(producto); }) : goToDetail}
              title="Ver detalle"
            >
              <span className="material-icons-round">visibility</span>
            </button>
          )}
          {isLogged && isCliente && showFav && (
            <button
              className={`ml-2 p-2 rounded-full ${isFav ? "bg-pink-300 text-pink-800" : "bg-pink-100 hover:bg-pink-200 text-pink-600"}`}
              onClick={e => {
                e.stopPropagation();
                if (isFav) {
                  removeFavorito(producto.id);
                } else {
                  addFavorito(producto);
                }
              }}
              title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <span className="material-icons-round">{isFav ? "favorite" : "favorite_border"}</span>
            </button>
          )}
          {!isLogged && (showCart || showFav) && (
            <button
              className="ml-2 p-2 rounded-full bg-purple-700 hover:bg-purple-800 text-white"
              onClick={e => { e.stopPropagation(); window.location.href = "/login"; }}
              title="Inicia sesión"
            >
              <span className="material-icons-round">login</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
