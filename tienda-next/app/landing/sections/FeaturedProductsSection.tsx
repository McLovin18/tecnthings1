"use client";

import React, { useEffect, useState } from "react";
import type {
  LandingSectionStyles,
  LandingFieldStyle,
} from "../../lib/landing-types";
import ProductoCard from "../../components/ProductoCard";

export type FeaturedProductsSectionProps = {
  title?: string;
  products?: any[]; // Se resolverán en la landing pública
  styles?: LandingSectionStyles;
  fieldStyles?: Record<string, LandingFieldStyle>;
  // Permite que el admin preview fuerce el comportamiento móvil o desktop
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

  if (!products.length) return null;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Ajustar elementos visibles según el ancho de pantalla
  useEffect(() => {
    // Si nos fuerzan modo móvil desde el preview, siempre 1 producto
    if (device === "mobile") {
      setItemsPerView(1);
      return;
    }

    const updateItemsPerView = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width < 640) {
        // móviles
        setItemsPerView(1);
      } else if (width < 1024) {
        // tablets / pantallas medianas
        setItemsPerView(3);
      } else {
        // laptops y superiores
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [device]);

  const effectiveItemsPerView = Math.min(itemsPerView, products.length);
  const hasCarousel = products.length > effectiveItemsPerView;

  const getVisibleProducts = () => {
    const count = hasCarousel ? effectiveItemsPerView : products.length;
    const slice: any[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (currentIndex + i) % products.length;
      slice.push(products[idx]);
    }
    return slice;
  };

  useEffect(() => {
    if (!hasCarousel || isHovered) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 3000);
    return () => clearInterval(id);
  }, [hasCarousel, isHovered, products.length]);

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

  return (
    <section
      style={{ paddingTop, paddingBottom }}
      className="px-4 lg:px-6 flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {title && (
        <h2
          className="text-3xl font-bold mb-4 text-center text-slate-900 dark:text-white"
          style={fieldStyles?.title}
        >
          {title}
        </h2>
      )}

      {hasCarousel && (
        <div className="flex items-center justify-center gap-3 mb-3">
          <button
            type="button"
            onClick={handlePrev}
            className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-icons-round text-[18px]">
              chevron_left
            </span>
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-300">
            Mostrando {effectiveItemsPerView} de {products.length} productos
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-icons-round text-[18px]">
              chevron_right
            </span>
          </button>
        </div>
      )}

      <div
        className={
          isSingleVisible
            ? "flex justify-center w-full max-w-md mx-auto"
            : "grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center w-full max-w-6xl mx-auto"
        }
      >
        {visibleProducts.map((prod: any) => (
          <div
            key={prod.id}
            className={isSingleVisible ? "w-full" : "w-full max-w-xs"}
          >
            <ProductoCard producto={prod} />
          </div>
        ))}
      </div>
    </section>
  );
}
