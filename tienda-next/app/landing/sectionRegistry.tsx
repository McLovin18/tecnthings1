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
import FeaturedProductsSection, {
  FeaturedProductsSectionProps,
} from "./sections/FeaturedProductsSection";
import FeaturedCategoriesSection, {
  FeaturedCategoriesSectionProps,
} from "./sections/FeaturedCategoriesSection";

export type SectionComponentProps = Record<string, any> & {
  styles?: LandingSectionStyles;
  fieldStyles?: Record<string, LandingFieldStyle>;
};

export const sectionRegistry: Record<string, ComponentType<SectionComponentProps>> = {
  hero: HeroSection as ComponentType<HeroSectionProps>,
  banner: BannerSection as ComponentType<BannerSectionProps>,
  gallery: GallerySection as ComponentType<GallerySectionProps>,
  featuredProducts: FeaturedProductsSection as ComponentType<FeaturedProductsSectionProps>,
  featuredCategories:
    FeaturedCategoriesSection as ComponentType<FeaturedCategoriesSectionProps>,
};

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
  return <Component {...props} styles={styles} fieldStyles={fieldStyles} />;
}
