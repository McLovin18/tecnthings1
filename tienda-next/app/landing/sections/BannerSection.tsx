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
      className="py-20 overflow-hidden"
    >
      <div
        className="overflow-hidden bg-slate-900/40 flex flex-col justify-center items-center"
        style={{ borderRadius }}
      >
        {finalBackgroundImage && (
          <div className="w-full aspect-[7/3] min-h-[220px] relative">
            <img
              src={finalBackgroundImage}
              alt={title || "Banner"}
              width={1400}
              height={600}
              className="absolute inset-0 w-full h-full object-cover transition-none"
              draggable={false}
              decoding="async"
              loading="lazy" // <--- AÑADE ESTO
              style={{ display: 'block', borderRadius }}
            />
          </div>
        )}
        <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col justify-center items-center px-6 py-6 md:px-10 md:py-8 max-w-3xl w-full h-full pointer-events-none">
          {title && (
            <h2
              className="text-2xl md:text-3xl font-bold mb-1 drop-shadow-lg"
              style={fieldStyles?.title}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-sm md:text-base opacity-90 drop-shadow"
              style={fieldStyles?.subtitle}
            >
              {subtitle}
            </p>
          )}
          {subtitle2 && (
            <p
              className="text-sm md:text-base opacity-90 drop-shadow"
              style={fieldStyles?.subtitle2}
            >
              {subtitle2}
            </p>
          )}
          {subtitle3 && (
            <p
              className="text-sm md:text-base opacity-90 drop-shadow"
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
