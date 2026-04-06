"use client";

import React, { useEffect, useState } from "react";
import type {
  LandingSectionStyles,
  LandingFieldStyle,
} from "../../lib/landing-types";
import ProductoCard from "../../components/ProductoCard";

export type FeaturedProductsSectionProps = {
  title?: string;
  products?: any[];
  styles?: LandingSectionStyles;
  fieldStyles?: Record<string, LandingFieldStyle>;
  device?: "mobile" | "desktop";
};

export default function FeaturedProductsSection({
  title = "Productos destacados",
  products = [],
  styles,
  fieldStyles,
  device,
}: FeaturedProductsSectionProps) {
  const paddingTop = styles?.paddingTop || "3rem";
  const paddingBottom = styles?.paddingBottom || "3rem";

  // ── Todos los hooks ANTES de cualquier return condicional ──
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    if (device === "mobile") {
      setItemsPerView(1);
      return;
    }
    const updateItemsPerView = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width < 640) setItemsPerView(1);
      else if (width < 1024) setItemsPerView(3);
      else setItemsPerView(5);
    };
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [device]);

  const effectiveItemsPerView = Math.min(itemsPerView, products.length);
  const hasCarousel = products.length > effectiveItemsPerView;

  useEffect(() => {
    if (!hasCarousel || isHovered) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 3000);
    return () => clearInterval(id);
  }, [hasCarousel, isHovered, products.length]);

  // ── Return condicional DESPUÉS de todos los hooks ──
  if (!products.length) return null;

  const getVisibleProducts = () => {
    const count = hasCarousel ? effectiveItemsPerView : products.length;
    const slice: any[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (currentIndex + i) % products.length;
      slice.push(products[idx]);
    }
    return slice;
  };

  const visibleProducts = getVisibleProducts();
  const isSingleVisible = effectiveItemsPerView === 1;

  const handlePrev = () => {
    if (!hasCarousel) return;
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    if (!hasCarousel) return;
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

const gridCols =
  effectiveItemsPerView === 2
    ? "grid-cols-2"
    : effectiveItemsPerView === 3
    ? "grid-cols-3"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";

  return (
    <section
      style={{ paddingTop, paddingBottom }}
      className="px-4 lg:px-4 flex flex-col items-center"
    >
      {/* Título */}
      {title && (
        <h2
          className="text-3xl font-extrabold mb-8 text-center text-slate-900 dark:text-white tracking-tight"
          style={fieldStyles?.title}
        >
          {title}
        </h2>
      )}

      {/* Contenedor carrusel */}
      <div
        className="w-full max-w-7xl mx-auto relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Flecha izquierda */}
        {hasCarousel && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Anterior"
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-md hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:border-purple-300 hover:scale-105 transition-all"
          >
            <span className="material-icons-round text-[20px]">chevron_left</span>
          </button>
        )}

        {/* Flecha derecha */}
        {hasCarousel && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Siguiente"
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-md hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:border-purple-300 hover:scale-105 transition-all"
          >
            <span className="material-icons-round text-[20px]">chevron_right</span>
          </button>
        )}

        {/* Grid de productos */}
        <div
          className={
            isSingleVisible
              ? "flex bg-b justify-center w-full max-w-sm mx-auto"
              : `grid gap-6 place-items-center w-full ${gridCols}`
          }
        >
          {visibleProducts.map((prod: any, idx: number) => (
            <div
              key={`${prod.id}-${currentIndex}-${idx}`}
              className={`transition-all duration-300 ${
                isSingleVisible ? "w-full" : "w-full max-w-xs"
              }`}
            >
              <ProductoCard producto={prod} />
            </div>
          ))}
        </div>

        {/* Dots indicadores */}
        {hasCarousel && products.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: products.length }).map((_, i) => (
              <button
                key={i}
                aria-label={`Ir a producto ${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-6 h-2 bg-purple-600 dark:bg-purple-400"
                    : "w-2 h-2 bg-white dark:bg-slate-600 hover:bg-purple-300 dark:hover:bg-purple-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}