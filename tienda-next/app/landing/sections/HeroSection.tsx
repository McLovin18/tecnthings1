"use client";

import React from "react";
import type {
  LandingSectionStyles,
  LandingFieldStyle,
} from "../../lib/landing-types";

type HeroItem = {
  title?: string;
  subtitle?: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string | null;
  fieldStyles?: Record<string, LandingFieldStyle>;
};

export type HeroSectionProps = {
  title?: string;
  subtitle?: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string | null;
  styles?: LandingSectionStyles;
  fieldStyles?: Record<string, LandingFieldStyle>;
  // Permite múltiples variantes de hero dentro de la misma sección
  items?: HeroItem[];
};

export default function HeroSection({
  title,
  subtitle,
  badge,
  buttonText,
  buttonLink,
  image,
  styles,
  fieldStyles,
  items,
}: HeroSectionProps) {
  const bg = styles?.backgroundColor;
  const color = styles?.textColor;
  const paddingTop = styles?.paddingTop || "3rem";
  const paddingBottom = styles?.paddingBottom || "3rem";
  const textAlign: React.CSSProperties["textAlign"] = styles?.textAlign || "left";
  const borderRadius = styles?.borderRadius || "1.5rem";

  const heroItems: HeroItem[] = (
    items && items.length
      ? items
      : [
          {
            title,
            subtitle,
            badge,
            buttonText,
            buttonLink,
            image,
          },
        ]
  ).filter((h) => h && (h.title || h.subtitle || h.image));

  if (!heroItems.length) return null;

  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroItems.length);
  }, [heroItems.length]);

  const goToPrev = React.useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? heroItems.length - 1 : (prev - 1) % heroItems.length
    );
  }, [heroItems.length]);

  React.useEffect(() => {
    if (heroItems.length <= 1) return;
    const id = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(id);
  }, [heroItems.length, goToNext]);

  const current = heroItems[Math.min(currentIndex, heroItems.length - 1)];

  const currentFieldStyles = current.fieldStyles || {};
  const badgeStyle: React.CSSProperties | undefined = {
    ...(fieldStyles?.badge || {}),
    ...(currentFieldStyles.badge || {}),
  };
  const titleStyle: React.CSSProperties | undefined = {
    ...(fieldStyles?.title || {}),
    ...(currentFieldStyles.title || {}),
  };
  const subtitleStyle: React.CSSProperties | undefined = {
    ...(fieldStyles?.subtitle || {}),
    ...(currentFieldStyles.subtitle || {}),
  };
  const buttonTextStyle: React.CSSProperties | undefined = {
    ...(fieldStyles?.buttonText || {}),
    ...(currentFieldStyles.buttonText || {}),
  };

  return (
    <section
      style={{
        ...(bg ? { backgroundColor: bg } : {}),
        ...(color ? { color } : {}),
        paddingTop,
        paddingBottom,
        textAlign,
      }}
      className="px-4 lg:px-6"
    >
      <div
        className="relative overflow-hidden aspect-4/5 lg:aspect-video bg-slate-200 dark:bg-neutral-900 group max-w-full"
        style={{ borderRadius }}
      >
        {current.image && (
          <img
            src={current.image}
            alt={current.title || "Hero"}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        {heroItems.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white w-8 h-8 md:w-10 md:h-10"
              onClick={goToPrev}
            >
              <span className="material-icons-round text-sm md:text-base">
                chevron_left
              </span>
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white w-8 h-8 md:w-10 md:h-10"
              onClick={goToNext}
            >
              <span className="material-icons-round text-sm md:text-base">
                chevron_right
              </span>
            </button>
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col items-center text-center">
          {current.badge && (
            <span
              className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest uppercase bg-white text-black dark:bg-slate-900 dark:text-white rounded-full"
              style={badgeStyle}
            >
              {current.badge}
            </span>
          )}
          {current.title && (
            <h2
              className="text-4xl font-extrabold text-white mb-4 leading-tight max-w-3xl"
              style={titleStyle}
            >
              {current.title}
            </h2>
          )}
          {current.subtitle && (
            <p
              className="text-slate-300 mb-6 text-sm max-w-xl"
              style={subtitleStyle}
            >
              {current.subtitle}
            </p>
          )}
          {current.buttonText && (
            <a
              href={current.buttonLink || "/products-by-category"}
              className="inline-flex items-center justify-center gap-2 py-4 px-6 bg-white text-black dark:bg-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform whitespace-nowrap"
              style={buttonTextStyle}
            >
              <span>{current.buttonText}</span>
              <span className="material-icons-round text-sm">arrow_forward</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}