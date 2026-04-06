"use client";

import React, { useEffect, useState } from "react";
import type {
  LandingSectionStyles,
  LandingFieldStyle,
} from "../../lib/landing-types";

export type GallerySectionProps = {
  title?: string;
  images?: string[];
  items?: { title?: string; image?: string }[];
  styles?: LandingSectionStyles;
  fieldStyles?: Record<string, LandingFieldStyle>;
};

export default function GallerySection({
  title,
  images = [],
  items,
  styles,
  fieldStyles,
}: GallerySectionProps) {
  const paddingTop = styles?.paddingTop || "3rem";
  const paddingBottom = styles?.paddingBottom || "3rem";

  // Normalizar datos: si vienen items nuevos los usamos, si no
  // caemos al array antiguo de imágenes.
  const galleryItems = (
    items && items.length
      ? items
      : images.map((src) => ({ title: "", image: src }))
  ) as { title?: string; image?: string }[];

  // ── Hooks SIEMPRE arriba, antes de cualquier return condicional ──
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
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
  }, []);

  const effectiveItemsPerView = Math.min(itemsPerView, galleryItems.length);
  const hasCarousel = galleryItems.length > effectiveItemsPerView;

  useEffect(() => {
    if (!hasCarousel || isPaused) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
    }, 3000);
    return () => clearInterval(id);
  }, [hasCarousel, galleryItems.length, isPaused]);

  // ── Return condicional DESPUÉS de todos los hooks ──
  if (!galleryItems.length) return null;

  const getVisibleItems = () => {
    const count = hasCarousel ? effectiveItemsPerView : galleryItems.length;
    const slice: typeof galleryItems = [];
    for (let i = 0; i < count; i++) {
      const idx = (currentIndex + i) % galleryItems.length;
      slice.push(galleryItems[idx]);
    }
    return slice;
  };

  const visibleItems = getVisibleItems();
  const isSingleVisible = effectiveItemsPerView === 1;
  const itemTitleStyle = fieldStyles?.itemTitle;

  const handlePrev = () => {
    if (!hasCarousel) return;
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const handleNext = () => {
    if (!hasCarousel) return;
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  };

  // Dots: cuántos "slides" posibles hay
  const totalSlides = hasCarousel
    ? galleryItems.length
    : 1;

  return (
    <section
      style={{ paddingTop, paddingBottom }}
      className="w-full max-w-full px-2 flex flex-col items-center overflow-x-hidden"
    >
      {/* Título */}
      {title && (
        <h2 className="text-3xl font-extrabold mb-8 text-center text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
      )}

      {/* Contenedor del carrusel */}
      <div
        className="w-full max-w-7xl mx-auto relative overflow-x-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ WebkitOverflowScrolling: 'touch' }}
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

        {/* Grid / items visibles */}
        <div
          className={
            isSingleVisible
              ? "flex justify-center w-full max-w-xs mx-auto"
              : `grid gap-5 place-items-center w-full ${
                  effectiveItemsPerView === 2
                    ? "grid-cols-2"
                    : effectiveItemsPerView === 3
                    ? "grid-cols-3"
                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                }`
          }
          style={{ minWidth: 0 }}
        >
          {visibleItems.map((item, idx) => (
            <div
              key={`${currentIndex}-${idx}`}
              className={`group flex flex-col items-center text-center transition-all duration-300 ${
                isSingleVisible ? "w-full" : "w-full max-w-[220px] sm:max-w-[240px] md:max-w-[260px]"
              }`}
              style={{ width: '100%', minWidth: 0 }}
            >
              {item.image && (
                <div className="w-full flex items-center justify-center rounded-2xl overflow-hidden bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-md group-hover:border-purple-200 dark:group-hover:border-purple-700 transition-all duration-300 p-4 aspect-square">
                  <img
                    src={item.image}
                    alt={item.title || title || "Imagen"}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    style={{ background: "none", boxShadow: "none" }}
                  />
                </div>
              )}
              {item.title && (
                <p
                  className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors"
                  style={itemTitleStyle}
                >
                  {item.title}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Dots indicadores */}
        {hasCarousel && totalSlides > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                aria-label={`Ir a slide ${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-6 h-2 bg-purple-600 dark:bg-purple-400"
                    : "w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-purple-300 dark:hover:bg-purple-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}