"use client";

import React from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";

export default function ProductoCard({
  producto,
  onClick,
  showCart = false,
  showEye = true,
  onAddCart,
  onEye,
  showFav = false,
}) {
  const {
    isLogged,
    isCliente,
    isAdmin,
    favoritos,
    addFavorito,
    removeFavorito,
    carrito,
    addCarrito,
    removeCarrito,
  } = useUser();
  const router = useRouter();

  const isFav = favoritos?.some((p) => p.id === producto.id);
  const inCart = carrito?.some((p) => p.id === producto.id);
  const sinStock = producto.stock === 0;

  const basePrice = Number(producto?.precio || 0);
  const discount = Number(producto?.descuento || 0);
  const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
  const fakeOldPrice = hasDiscount
    ? Math.ceil(basePrice / (1 - discount / 100))
    : basePrice;
  const finalPrice = hasDiscount ? basePrice * (1 - discount / 100) : basePrice;

  const goToDetail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let detailUrl = `/product-detail?id=${producto.id}`;
    try {
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/home")) {
        detailUrl = `/home/product-detail?id=${producto.id}`;
      } else {
        if (isAdmin) detailUrl = `/admin/product-detail?id=${producto.id}`;
        if (isCliente) detailUrl = `/home/product-detail?id=${producto.id}`;
      }
    } catch {
      if (isAdmin) detailUrl = `/admin/product-detail?id=${producto.id}`;
      if (isCliente) detailUrl = `/home/product-detail?id=${producto.id}`;
    }
    router.push(detailUrl);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    isFav ? removeFavorito(producto.id) : addFavorito(producto);
  };

  const handleCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sinStock) return;
    if (onAddCart) { onAddCart(producto); return; }
    inCart ? removeCarrito(producto.id) : addCarrito({ ...producto, cantidad: 1 });
  };

  return (
    <div
      onClick={onClick || goToDetail}
      className="
        group cursor-pointer
        bg-white dark:bg-white/[0.04]
         dark:border-white/10
        rounded-2xl overflow-hidden
        shadow-sm
        hover:shadow-xl dark:hover:shadow-purple-950/60
        hover:border-[#7b68ee] dark:hover:border-[#7b68ee]
        transition-all duration-300

        sm:h-full

        /* ── MÓVIL: horizontal (imagen izq + info der) ── */
        flex flex-row items-stretch

        /* ── SM+: vertical (imagen arriba + info abajo) ── */
        sm:flex-col
      "
    >

      {/* ══ IMAGEN ══════════════════════════════════════════════ */}
      <div
        className="
          relative flex-shrink-0 overflow-hidden
          bg-white dark:bg-white/[0.03]

          /* móvil: cuadrado fijo a la izquierda */
          w-[140px] h-[140px]

          /* sm+: ancho completo, altura generosa */
          sm:w-full sm:h-56
        "
      >
      <img
        src={producto.imagenes?.[0] || "/no-image.png"}
        alt={producto.nombre}
        loading="lazy" // <--- AÑADE ESTO
        decoding="async" // <--- AYUDA AL RENDIMIENTO
        className="
          w-full h-full object-contain
          p-3 sm:p-5
          group-hover:scale-105
          transition-transform duration-500
        "
      />
        {/* Badge descuento */}
        {hasDiscount && (
          <span className="
            absolute top-2 left-2 z-10
            bg-red-500 text-white
            text-[10px] sm:text-xs font-bold
            px-1.5 sm:px-2 py-0.5 sm:py-1
            rounded-full shadow
          ">
            -{discount}%
          </span>
        )}

        {/* Overlay sin stock */}
        {sinStock && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/50 flex items-center justify-center z-10">
            <span className="
              text-[10px] sm:text-xs font-bold
              text-slate-500 dark:text-white/60
              bg-white dark:bg-slate-900
              px-2 py-0.5 rounded-full
              border border-slate-200 dark:border-white/10
            ">
              Sin stock
            </span>
          </div>
        )}

        {/* Botón favorito — solo si el usuario está logueado */}
        {isLogged && (
          <button
            onClick={handleFav}
            className={`
              absolute top-2 right-2 z-20
              w-8 h-8 rounded-full
              flex items-center justify-center
              transition-all duration-200 shadow-sm
              ${isFav
                ? "bg-pink-500 text-white scale-100"
                : "bg-white/80 dark:bg-slate-900/80 text-slate-400 dark:text-white/40 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
              }
            `}
            title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <span className="material-icons-round text-[16px]">
              {isFav ? "favorite" : "favorite_border"}
            </span>
          </button>
        )}
      </div>

      {/* ══ INFO ════════════════════════════════════════════════ */}
      <div className="
        flex flex-col flex-1 min-w-0
        p-2 sm:p-4
        justify-between
        sm:h-full
      ">
        {/* Nombre */}
        <p className="
          font-semibold leading-tight
          text-slate-800 dark:text-white

          /* móvil: más grande para aprovechar el espacio horizontal */
          text-base
          sm:text-sm

          /* recortar si es muy largo */
          line-clamp-3 sm:line-clamp-3
        ">
          {producto.nombre}
        </p>

        {/* Descripción corta — solo en móvil donde hay más espacio */}
        {producto.descripcion && (
          <p className="
            mt-0.5 text-xs text-slate-400 dark:text-white/35
            line-clamp-2
            sm:hidden
          ">
            {producto.descripcion}
          </p>
        )}

        {/* Precios */}
        <div className="mt-1 sm:mt-3 flex items-baseline gap-2 flex-wrap">
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-[#7b68ee] dark:text-white/30 line-through">
              ${fakeOldPrice.toFixed(2)}
            </span>
          )}
          <span className="
            text-xl sm:text-lg font-extrabold
            text-[#7b68ee] dark:text-purple-300
          ">
            ${basePrice.toFixed(2)}
          </span>
        </div>

        {/* Acciones */}
        {(showCart || showEye) && (
          <div className="mt-2 sm:mt-3 flex gap-2">
            {showCart && (
              <button
                onClick={handleCart}
                disabled={sinStock}
                className={`
                  flex-1 flex items-center justify-center gap-1.5
                  py-2 rounded-xl text-sm font-semibold
                  transition-all duration-200
                  ${sinStock
                    ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20 cursor-not-allowed"
                    : inCart
                      ? "bg-purple-100 dark:bg-purple-900/40 text-[#7b68ee] dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60"
                      : "bg-[#7b68ee] hover:bg-purple-700 text-white shadow-sm hover:shadow-md active:scale-95"
                  }
                `}
              >
                <span className="material-icons-round text-[16px]">
                  {inCart ? "remove_shopping_cart" : "add_shopping_cart"}
                </span>
                <span className="hidden xs:inline sm:hidden lg:inline">
                  {inCart ? "Quitar" : "Añadir"}
                </span>
              </button>
            )}

            {showEye && (
              <button
                onClick={(e) => { e.stopPropagation(); onEye ? onEye(producto) : goToDetail(e); }}
                className="
                  flex items-center justify-center
                  w-9 h-9 rounded-xl flex-shrink-0
                  bg-slate-100 dark:bg-white/5
                  text-slate-500 dark:text-white/50
                  hover:bg-slate-200 dark:hover:bg-white/10
                  hover:text-slate-700 dark:hover:text-white
                  transition-all duration-200
                "
                title="Ver detalle"
              >
                <span className="material-icons-round text-[18px]">visibility</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}