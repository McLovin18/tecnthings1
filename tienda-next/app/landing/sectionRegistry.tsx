"use client";

import type { ComponentType } from "react";
import type {
  LandingSection,
  LandingSectionStyles,
  LandingFieldStyle,
} from "../lib/landing-types";

import HeroSection, { HeroSectionProps } from "./sections/HeroSection";
import BannerSection, { BannerSectionProps } from "./sections/BannerSection";
import GallerySection, { GallerySectionProps } from "./sections/GallerySection";
import FeaturedProductsSection, { FeaturedProductsSectionProps } from "./sections/FeaturedProductsSection";
import FeaturedCategoriesSection, { FeaturedCategoriesSectionProps } from "./sections/FeaturedCategoriesSection";

import GoogleCommentsSection, { GoogleCommentsSectionProps } from "./sections/GoogleCommentsSection";

// Definición de props para cada sección
export type SectionComponentProps = {
  props?: any;
  styles?: LandingSectionStyles;
  fieldStyles?: Record<string, LandingFieldStyle>;
};


// import HeroGoogleReviewSection, { HeroGoogleReviewSectionProps } from "./sections/HeroGoogleReviewSection";

export const sectionRegistry: Record<string, ComponentType<any>> = {
  hero: HeroSection,
  // heroGoogleReview: HeroGoogleReviewSection, // Eliminado de la landing
  googleComments: GoogleCommentsSection,
  banner: BannerSection,
  gallery: GallerySection,
  featuredProducts: FeaturedProductsSection,
  featuredCategories: FeaturedCategoriesSection,
};

// Eliminado fragmento duplicado

export function SectionRenderer({ section }: { section: LandingSection }) {
  if (section.hidden) return null;

  const Component = sectionRegistry[section.type];
  if (!Component) {
    // Fallback muy simple para tipos desconocidos
    return (
      <section className="px-4 py-6 lg:px-6">
        <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded-xl overflow-auto">
          Sección desconocida: {section.type}
        </pre>
      </section>
    );
  }

  const { props = {}, styles, fieldStyles, fieldPositions } = section;
  // Si es googleComments, parsear comments si es string
  let parsedProps = { ...props };
  if (section.type === "googleComments" && typeof props.comments === "string") {
    try {
      parsedProps.comments = JSON.parse(props.comments);
    } catch {
      parsedProps.comments = [];
    }
  }

  // Detectar device (desktop/mobile) para estilos responsive
  let device: "desktop" | "mobile" = "desktop";
  if (typeof window !== "undefined") {
    device = window.innerWidth < 640 ? "mobile" : "desktop";
  }
  // Aplanar fieldStyles responsive
  let flatFieldStyles = fieldStyles;
  if (fieldStyles) {
    flatFieldStyles = Object.fromEntries(
      Object.entries(fieldStyles).map(([k, v]) => {
        // Detectar si hay estructura responsive (desktop o mobile definidos)
        const hasResponsiveStructure = v && ((v as any).desktop !== undefined || (v as any).mobile !== undefined);
        if (hasResponsiveStructure) {
          // Return el valor para el device actual, fallback a desktop, luego a empty object
          return [k, (v as any)[device] || (v as any).desktop || {}];
        }
        // Si no hay estructura responsive, devolver como está
        return [k, v || {}];
      })
    );
  }

  return <Component {...parsedProps} styles={styles} fieldStyles={flatFieldStyles} fieldPositions={fieldPositions} />;
}
