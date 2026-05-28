"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import BottomBarPublic from "../../components/BottomBarPublic";
import RelatedProductsCarousel from "../../components/RelatedProductsCarousel";
import { Loading3DIcon } from "../../components/Loading3DIcon";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import type { ProductReview } from "../../lib/reviews-types";

const Markdown = dynamic(() => import("../../components/Markdown"), { ssr: false });

type ProductDetailClientProps = {
  product: any;
  relatedProducts: any[];
};

function parseDescription(text: string) {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const items: { text: string; sub: string[] }[] = [];
  let current: string | null = null;
  let sub: string[] = [];

  for (const line of lines) {
    const value = line.trim();
    if (!value) continue;

    if (value.startsWith("»")) {
      if (current !== null) {
        items.push({ text: current, sub });
        sub = [];
      }
      current = value.replace(/^»+/, "").trim();
      continue;
    }

    if (value.startsWith("–")) {
      sub.push(value.replace(/^–+/, "").trim());
      continue;
    }

    if (sub.length > 0) {
      sub[sub.length - 1] += ` ${value}`;
    } else if (current !== null) {
      current += ` ${value}`;
    }
  }

  if (current !== null) {
    items.push({ text: current, sub });
  }

  return items;
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [relacionados] = useState<any[]>(relatedProducts || []);
  const [imgIdx, setImgIdx] = useState(0);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [activeTab, setActiveTab] = useState<"caracteristicas" | "resenas" | null>("caracteristicas");

  const {
    isLogged,
    user,
    favoritos,
    addFavorito,
    removeFavorito,
    carrito,
    addCarrito,
    removeCarrito,
  } = useUser();

  const { showToast } = useToast();

  useEffect(() => {
    if (isLogged && user) {
      setReviewName(user.displayName || "");
      setReviewEmail(user.email || "");
    }
  }, [isLogged, user]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        if (res.ok) {
          setReviews(await res.json());
        }
      } catch {
        setReviews([]);
      }
    }

    fetchReviews();
  }, [product.id]);

  const maxCantidad = Number(product.stock || 0);
  const isFav = favoritos?.some((p) => p.id === product.id);
  const inCart = carrito?.some((p) => p.id === product.id);

  const basePrice = Number(product.precio || 0);
  const discount = Number(product.descuento || 0);
  const hasDiscount = !Number.isNaN(discount) && discount > 0 && discount < 100;
  const fakeOldPrice = hasDiscount ? Math.round(basePrice / (1 - discount / 100)) : null;
  const avgRating = reviews.length > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0;

  const descItems = useMemo(() => parseDescription(product.descripcion || ""), [product.descripcion]);
  const rawDescripcion = product.descripcion || "";
  const hasCaracteristicas = product.caracteristicas?.length > 0;

  const handleAddCart = () => {
    if (inCart) {
      removeCarrito(product.id);
      showToast("Eliminado del carrito", "info");
      return;
    }

    addCarrito({ ...product, cantidad });
    showToast(`${product.nombre} añadido al carrito`, "success");
  };

  const handleFav = () => {
    if (isFav) {
      removeFavorito(product.id);
      return;
    }

    addFavorito(product);
  };

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError("");

    if (!reviewRating || !reviewText) {
      setReviewError("Completa la calificación y el comentario");
      setReviewLoading(false);
      return;
    }

    if (!isLogged && (!reviewName || !reviewEmail)) {
      setReviewError("Completa nombre y correo para publicar la reseña");
      setReviewLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userId: user?.uid || "",
          userName: reviewName || user?.displayName || "Usuario",
          userEmail: reviewEmail,
          rating: reviewRating,
          comment: reviewText,
        }),
      });

      if (res.ok) {
        setReviewText("");
        setReviewRating(0);
        if (!isLogged) {
          setReviewName("");
          setReviewEmail("");
        }

        const refresh = await fetch(`/api/reviews?productId=${product.id}`);
        if (refresh.ok) {
          setReviews(await refresh.json());
        }
      } else {
        setReviewError("Error al enviar reseña");
      }
    } catch {
      setReviewError("Error de red");
    }

    setReviewLoading(false);
  }

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition-colors";

  const reviewsProps = {
    reviews,
    avgRating,
    reviewRating,
    setReviewRating,
    reviewName,
    setReviewName,
    reviewEmail,
    setReviewEmail,
    reviewText,
    setReviewText,
    reviewError,
    reviewLoading,
    handleSubmitReview,
    isLogged,
    inputCls,
  };

  const handleTabToggle = (tab: "caracteristicas" | "resenas") => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  return (
    <div className="min-h-screen flex flex-col mt-2 bg-white dark:bg-black text-slate-900 dark:text-white transition-colors">
      <BottomBarPublic />

      <div className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-14">
          <div className="w-full md:w-[44%] flex flex-col gap-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden dark:bg-white/3 border border-slate-100 dark:border-white/6">
              {hasDiscount && (
                <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}

              <img
                src={product.imagenes?.[imgIdx] || "/no-image.png"}
                alt={product.nombre}
                className="w-full h-full object-contain p-5"
              />

              {product.imagenes?.length > 1 && imgIdx > 0 && (
                <button
                  onClick={() => setImgIdx(imgIdx - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <span className="material-icons-round text-slate-600 dark:text-white/70 text-lg">chevron_left</span>
                </button>
              )}

              {product.imagenes?.length > 1 && imgIdx < product.imagenes.length - 1 && (
                <button
                  onClick={() => setImgIdx(imgIdx + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <span className="material-icons-round text-slate-600 dark:text-white/70 text-lg">chevron_right</span>
                </button>
              )}
            </div>

            {product.imagenes?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {product.imagenes.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setImgIdx(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${imgIdx === idx ? "border-[#7b68ee] ring-2 ring-[#7b68ee]/30" : "border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100"}`}
                  >
                    <img src={img} alt={`${product.nombre} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-1 flex gap-2">
              {hasCaracteristicas && (
                <button
                  onClick={() => handleTabToggle("caracteristicas")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${activeTab === "caracteristicas" ? "bg-[#7b68ee] text-white border-[#7b68ee]" : "bg-white dark:bg-white/3 border-slate-200 dark:border-white/7 text-slate-700 dark:text-white/80"}`}
                >
                  Características
                </button>
              )}

              <button
                onClick={() => handleTabToggle("resenas")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${activeTab === "resenas" ? "bg-[#7b68ee] text-white border-[#7b68ee]" : "bg-white dark:bg-white/3 border-slate-200 dark:border-white/7 text-slate-700 dark:text-white/80"}`}
              >
                Reseñas
              </button>
            </div>

            <div className="hidden md:block w-full mt-1">
              {activeTab === "caracteristicas" && hasCaracteristicas && (
                <div className="rounded-2xl border border-slate-100 dark:border-white/7 bg-white dark:bg-white/3 p-4 sm:p-5">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
                    {product.caracteristicas.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 rounded-xl bg-slate-50 dark:bg-white/3 p-3">
                        <span className="material-icons-round text-[#7b68ee] text-[18px] mt-0.5">check_circle</span>
                        <Markdown>{item}</Markdown>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "resenas" && <ReviewsSection {...reviewsProps} />}
            </div>
          </div>

          <div className="w-full md:w-[56%] flex flex-col gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[2.15rem] font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
                {product.nombre}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-white/40">
                <span className="material-icons-round text-base">verified</span>
                <span>{product.marca || "TecnoThings"}</span>
              </div>
            </div>

            <div className="flex items-end gap-3 flex-wrap">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#7b68ee]">
                ${basePrice.toFixed(2)}
              </div>

              {hasDiscount && fakeOldPrice && (
                <div className="text-sm sm:text-base text-slate-400 line-through">
                  ${fakeOldPrice.toFixed(2)}
                </div>
              )}

              {hasDiscount && (
                <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                  Oferta
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-white/60">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${maxCantidad > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/40"}`}>
                <span className="material-icons-round text-[15px]">{maxCantidad > 0 ? "inventory_2" : "block"}</span>
                {maxCantidad > 0 ? `${maxCantidad} disponibles` : "Agotado"}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-white/70">
                <span className="material-icons-round text-[15px]">star</span>
                {avgRating > 0 ? avgRating.toFixed(1) : "Sin reseñas"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={handleAddCart}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-colors ${inCart ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-[#7b68ee] hover:bg-[#6d28d9] text-white"}`}
              >
                <span className="material-icons-round text-[18px]">{inCart ? "remove_shopping_cart" : "shopping_cart"}</span>
                {inCart ? "Quitar del carrito" : "Añadir al carrito"}
              </button>

              {isLogged && (
                <button
                  onClick={handleFav}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${isFav ? "bg-red-500 text-white shadow" : "bg-slate-100 dark:bg-white/6 text-slate-400 dark:text-white/30 hover:bg-slate-200 dark:hover:bg-white/10"}`}
                  title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  <span className="material-icons-round text-xl">{isFav ? "favorite" : "favorite_border"}</span>
                </button>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">Descripción del producto</h2>
              {rawDescripcion.trim() ? (
                descItems.length > 0 && (descItems.length > 1 || descItems[0].sub.length > 0 || descItems[0].text !== rawDescripcion.trim()) ? (
                  <ul className="space-y-2">
                    {descItems.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-black/80 dark:text-white/80 leading-relaxed">
                        <span className="text-slate-300 dark:text-white/20 shrink-0 mt-0.5">›</span>
                        <span>
                          {item.text}
                          {item.sub.length > 0 && (
                            <ul className="mt-1 space-y-0.5 ml-3">
                              {item.sub.map((s, j) => (
                                <li key={j} className="flex gap-1.5 text-slate-400 dark:text-white/35">
                                  <span className="shrink-0">–</span>{s}
                                </li>
                              ))}
                            </ul>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-black/80 dark:text-white/80 leading-relaxed whitespace-pre-line">{rawDescripcion}</p>
                )
              ) : (
                <p className="text-sm text-slate-400 dark:text-white/40">Sin descripción</p>
              )}
            </div>

            {!isLogged && (
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/25 bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/4 rounded-xl px-3 py-2.5">
                <span className="material-icons-round text-sm shrink-0">info</span>
                <span>
                  Mejor experiencia al{" "}
                  <a href="/login?tab=register" className="underline underline-offset-2 text-slate-600 dark:text-white/40 hover:text-slate-900 dark:hover:text-white/70 transition-colors">
                    iniciar sesión
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden mt-4 flex flex-col gap-0 px-3 sm:px-6">
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-white/8">
          {hasCaracteristicas && (
            <button
              onClick={() => handleTabToggle("caracteristicas")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${activeTab === "caracteristicas" ? "bg-[#7b68ee] dark:bg-[#7b68ee] text-white dark:text-slate-900" : "bg-white dark:bg-white/3 text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/7"}`}
            >
              <span className="material-icons-round text-[16px]">list_alt</span>
              Características
            </button>
          )}

          <button
            onClick={() => handleTabToggle("resenas")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${hasCaracteristicas ? "border-l border-slate-200 dark:border-white/8" : ""} ${activeTab === "resenas" ? "bg-[#7b68ee] dark:bg-[#7b68ee] text-white dark:text-slate-900" : "bg-white dark:bg-white/3 text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/7"}`}
          >
            <span className="material-icons-round text-[16px]">star_outline</span>
            Reseñas
            {reviews.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === "resenas" ? "bg-[#7b68ee] dark:bg-slate-900/20" : "bg-slate-100 dark:bg-[#7b68ee] text-slate-600 dark:text-white/50"}`}>
                {reviews.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "resenas" && (
          <div className="border border-t-0 border-slate-200 dark:border-white/8 rounded-b-xl px-4 py-4 bg-slate-50 dark:bg-white/2">
            <ReviewsSection {...reviewsProps} compact />
          </div>
        )}

        {activeTab === "caracteristicas" && hasCaracteristicas && (
          <div className="border border-t-0 border-slate-200 dark:border-white/8 rounded-b-xl px-4 py-4 bg-slate-50 dark:bg-white/2">
            <ul className="space-y-2">
              {product.caracteristicas.map((c: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-black/80 dark:text-white/80">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20 mt-2 shrink-0" />
                  <Markdown>{c}</Markdown>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto w-full px-1 sm:px-3 pb-10">
        <RelatedProductsCarousel productos={relacionados} title="Productos relacionados" />
      </div>
    </div>
  );
}

function ReviewsSection({
  reviews,
  avgRating,
  reviewRating,
  setReviewRating,
  reviewName,
  setReviewName,
  reviewEmail,
  setReviewEmail,
  reviewText,
  setReviewText,
  reviewError,
  reviewLoading,
  handleSubmitReview,
  isLogged,
  inputCls,
  compact = false,
}: any) {
  return (
    <div className={compact ? "space-y-4" : "rounded-2xl border border-slate-100 dark:border-white/7 bg-white dark:bg-white/3 p-4 sm:p-5 space-y-6"}>
      <h2 className="text-lg font-bold">Reseñas</h2>

      {reviews.length > 0 ? (
        <div className="flex items-center gap-3">
          <span className="text-4xl font-extrabold text-slate-800 dark:text-white leading-none">
            {avgRating.toFixed(1)}
          </span>
          <div>
            <div className="flex gap-0.5 mb-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-lg ${i < Math.round(avgRating) ? "text-yellow-400" : "text-slate-200 dark:text-white/10"}`}>★</span>
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-white/25">
              {reviews.length} reseña{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-black/80 dark:text-white/80">Sé el primero en dejar una reseña.</p>
      )}

      <form onSubmit={handleSubmitReview} className="space-y-3">
        <div className="flex gap-2 items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setReviewRating(i + 1)}
              className={`text-2xl transition-colors ${i < reviewRating ? "text-yellow-400" : "text-slate-300 dark:text-white/20"}`}
            >
              ★
            </button>
          ))}
        </div>

        {!isLogged && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Tu nombre" value={reviewName} onChange={(e) => setReviewName(e.target.value)} />
            <input className={inputCls} placeholder="Tu correo" value={reviewEmail} onChange={(e) => setReviewEmail(e.target.value)} />
          </div>
        )}

        <textarea
          className={`${inputCls} min-h-28`}
          placeholder="Escribe tu reseña"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />

        {reviewError && <p className="text-sm text-red-500">{reviewError}</p>}

        <button
          type="submit"
          disabled={reviewLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-colors bg-[#7b68ee] hover:bg-[#6d28d9] text-white disabled:opacity-60"
        >
          {reviewLoading ? "Enviando..." : "Publicar reseña"}
        </button>
      </form>

      <div className="space-y-3">
        {reviews.map((review: any, index: number) => (
          <div key={index} className="rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/2 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm text-slate-800 dark:text-white">{review.userName || "Usuario"}</p>
              <span className="text-xs text-slate-400">{review.rating}/5</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-white/70 mt-1">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}