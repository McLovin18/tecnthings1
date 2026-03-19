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


import HeroGoogleReviewSection, { HeroGoogleReviewSectionProps } from "./sections/HeroGoogleReviewSection";

export const sectionRegistry: Record<string, ComponentType<any>> = {
  hero: HeroSection,
  heroGoogleReview: HeroGoogleReviewSection,
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
      <section className="px-4 py-8 lg:px-6">
        <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded-xl overflow-auto">
          Sección desconocida: {section.type}
        </pre>
      </section>
    );
  }

  const { props = {}, styles, fieldStyles } = section;
  // Si es googleComments, parsear comments si es string
  let parsedProps = { ...props };
  if (section.type === "googleComments" && typeof props.comments === "string") {
    try {
      parsedProps.comments = JSON.parse(props.comments);
    } catch {
      parsedProps.comments = [];
    }
    // Log para depuración
    console.log("[SectionRenderer] googleComments parsedProps.comments:", parsedProps.comments);
  }
  return <Component {...parsedProps} styles={styles} fieldStyles={fieldStyles} />;
}
