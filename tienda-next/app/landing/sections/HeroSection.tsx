"use client";


// Hook para obtener detalles de Google Maps Place
function useGoogleMapsPlaceDetails(placeId?: string, enabled?: boolean) {
  const [data, setData] = React.useState<{ rating?: number; user_ratings_total?: number } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled || !placeId) return;
    setLoading(true);
    setError(null);
    const url = `/api/google-maps?place_id=${placeId}`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (typeof json.rating !== "undefined" && typeof json.ratingCount !== "undefined") {
          setData({
            rating: json.rating,
            user_ratings_total: json.ratingCount,
          });
        } else {
          setError(json.error || "No se pudo obtener la información de Google Maps");
        }
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [placeId, enabled]);

  return { data, loading, error };
}

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
  googleMaps?: boolean;
  rating?: number;
  ratingCount?: number;
  generalMessage?: string;
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
  const paddingTop = styles?.paddingTop || "1.5rem";
  const paddingBottom = styles?.paddingBottom || "1.5rem";
  const textAlign: React.CSSProperties["textAlign"] = styles?.textAlign || "left";
  const borderRadius = styles?.borderRadius || "1.5rem";

  // Obtener place_id de variable de entorno
  const placeId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLACE_ID;
  // Detectar si alguna variante tiene googleMaps activo
  const hasGoogleMaps = items && items.some((i) => i.googleMaps);
  const { data: googleMapsData } = useGoogleMapsPlaceDetails(placeId, hasGoogleMaps);

  const heroItems: HeroItem[] = (
    items && items.length
      ? items.map((item) => {
          if (item.googleMaps && googleMapsData) {
            return {
              ...item,
              rating: googleMapsData.rating,
              ratingCount: googleMapsData.user_ratings_total,
            };
          }
          return item;
        })
      : [
          {
            title,
            subtitle,
            badge,
            buttonText,
            buttonLink,
            image,
            googleMaps,
            rating: googleMapsData?.rating,
            ratingCount: googleMapsData?.user_ratings_total,
            generalMessage,
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
        className="relative overflow-hidden aspect-[4/4] lg:aspect-[16/6] bg-slate-200 dark:bg-neutral-900 group max-w-full"
        style={{ borderRadius }}
      >
        {/* Campos especiales para Google Maps */}
        {current.googleMaps && (
          <div className="absolute top-4 left-4 bg-green-50 dark:bg-green-900 rounded-lg p-4 z-30 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-2">
              {/* Estrellas visuales */}
              {Array.from({ length: 5 }).map((_, idx) => {
                const rating = current.rating ?? 0;
                // Calcula el porcentaje de pintado para esta estrella
                const fill = Math.max(0, Math.min(1, rating - idx));
                return (
                  <span key={idx} style={{ position: 'relative', display: 'inline-block', width: 32, height: 32 }}>
                    <svg width="32" height="32" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id={`star-gradient-${idx}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset={`${fill * 100}%`} stopColor="#FACC15" />
                          <stop offset={`${fill * 100}%`} stopColor="#fff" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points="12,2 15,9 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,9"
                        fill={`url(#star-gradient-${idx})`}
                        stroke="#FACC15"
                        strokeWidth="0.5"
                      />
                    </svg>
                  </span>
                );
              })}
              <span className="text-xl font-bold text-green-700 dark:text-green-300 ml-2">
                {current.rating ?? "-"}
              </span>
              <span className="text-sm text-green-700 dark:text-green-300">
                ({current.ratingCount ?? 0} reseñas)
              </span>
            </div>
            {current.generalMessage && (
              <div className="text-green-700 dark:text-green-300 text-sm">
                {current.generalMessage}
              </div>
            )}
          </div>
        )}
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