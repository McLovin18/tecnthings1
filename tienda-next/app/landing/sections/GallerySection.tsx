"use client";

import React, { useEffect, useState } from "react";
import type {
  LandingSectionStyles,
  LandingFieldStyle,
} from "../../lib/landing-types";

export type GallerySectionProps = {
  title?: string;
  images?: string[]; // compatibilidad con datos antiguos
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
  const galleryItems = (items && items.length
    ? items
    : images.map((src) => ({ title: "", image: src }))) as {
    title?: string;
    image?: string;
  }[];

  if (!galleryItems.length) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1); // móviles
      } else if (width < 1024) {
        setItemsPerView(3); // tablets
      } else {
        setItemsPerView(4); // desktop
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const effectiveItemsPerView = Math.min(itemsPerView, galleryItems.length);
  const hasCarousel = galleryItems.length > effectiveItemsPerView;

  const getVisibleItems = () => {
    const count = hasCarousel ? effectiveItemsPerView : galleryItems.length;
    const slice: typeof galleryItems = [];
    for (let i = 0; i < count; i++) {
      const idx = (currentIndex + i) % galleryItems.length;
      slice.push(galleryItems[idx]);
    }
    return slice;
  };

  useEffect(() => {
    if (!hasCarousel) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
    }, 3000);
    return () => clearInterval(id);
  }, [hasCarousel, galleryItems.length]);

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

  return (
    <section
      style={{ paddingTop, paddingBottom }}
      className="px-4 lg:px-6 flex flex-col items-center"
    >
      {title && (
        <h2 className="text-3xl font-bold mb-4 text-center text-slate-900 dark:text-white">{title}</h2>
      )}

      {hasCarousel && (
        <div className="flex items-center justify-center gap-3 mb-3">
          <button
            type="button"
            onClick={handlePrev}
            className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-icons-round text-[18px]">chevron_left</span>
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-300">
            Mostrando {effectiveItemsPerView} de {galleryItems.length} logos
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-icons-round text-[18px]">chevron_right</span>
          </button>
        </div>
      )}

      <div
        className={
          isSingleVisible
            ? "flex justify-center w-full max-w-md mx-auto"
            : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center w-full max-w-6xl mx-auto"
        }
      >
        {visibleItems.map((item, idx) => (
          <div
            key={idx}
            className={
              isSingleVisible
                ? "w-full flex flex-col items-center text-center"
                : "w-full max-w-xs flex flex-col items-center text-center"
            }
          >
            {item.title && (
              <p
                className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
                style={itemTitleStyle}
              >
                {item.title}
              </p>
            )}
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 w-full">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title || title || "Logo"}
                  className="w-full h-full object-contain p-4"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
