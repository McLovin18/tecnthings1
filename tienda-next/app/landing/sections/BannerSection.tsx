"use client";

import React from "react";
import type {
  LandingSectionStyles,
  LandingFieldStyle,
} from "../../lib/landing-types";

export type BannerSectionProps = {
  title?: string;
  subtitle?: string;
  subtitle2?: string;
  subtitle3?: string;
  backgroundImage?: string | null;
  image?: string | null; // compat legacy
  styles?: LandingSectionStyles;
  fieldStyles?: Record<string, LandingFieldStyle>;
};

export default function BannerSection({
  title,
  subtitle,
  subtitle2,
  subtitle3,
  backgroundImage,
  image,
  styles,
  fieldStyles,
}: BannerSectionProps) {
  const bg = styles?.backgroundColor;
  const color = styles?.textColor;
  const paddingTop = styles?.paddingTop || "2rem";
  const paddingBottom = styles?.paddingBottom || "2rem";
  const borderRadius = styles?.borderRadius || "1rem";

  const finalBackgroundImage = backgroundImage || image || null;

  return (
    <section
      style={{
        ...(bg ? { backgroundColor: bg } : {}),
        ...(color ? { color } : {}),
        paddingTop,
        paddingBottom,
      }}
      className="px-4 lg:px-6 overflow-hidden"
    >
      <div
        className="relative overflow-hidden bg-slate-900/40"
        style={{ borderRadius }}
      >
        {finalBackgroundImage && (
          <img
            src={finalBackgroundImage}
            alt={title || "Banner"}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="relative px-6 py-6 md:px-10 md:py-8 flex flex-col gap-2 max-w-3xl">
          {title && (
            <h2
              className="text-2xl md:text-3xl font-bold mb-1"
              style={fieldStyles?.title}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-sm md:text-base opacity-90"
              style={fieldStyles?.subtitle}
            >
              {subtitle}
            </p>
          )}
          {subtitle2 && (
            <p
              className="text-sm md:text-base opacity-90"
              style={fieldStyles?.subtitle2}
            >
              {subtitle2}
            </p>
          )}
          {subtitle3 && (
            <p
              className="text-sm md:text-base opacity-90"
              style={fieldStyles?.subtitle3}
            >
              {subtitle3}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
