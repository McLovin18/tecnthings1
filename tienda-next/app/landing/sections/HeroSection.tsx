"use client";

import React from "react";
import type {
  LandingSectionStyles,
  LandingFieldStyle,
} from "../../lib/landing-types";

// ── Hook ────────────────────────────────────────────────────────────────────
function useGoogleMapsPlaceDetails(placeId?: string, enabled?: boolean) {
  const [data, setData] = React.useState<{
    rating?: number;
    user_ratings_total?: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled || !placeId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/google-maps?place_id=${placeId}`)
      .then((res) => res.json())
      .then((json) => {
        if (
          typeof json.rating !== "undefined" &&
          typeof json.ratingCount !== "undefined"
        ) {
          setData({ rating: json.rating, user_ratings_total: json.ratingCount });
        } else {
          setError(json.error || "No se pudo obtener la información de Google Maps");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [placeId, enabled]);

  return { data, loading, error };
}

// ── Tipos ────────────────────────────────────────────────────────────────────
type HeroItem = {
  title?: string;
  subtitle?: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string | null;
  googleMaps?: boolean;
  rating?: number;
  ratingCount?: number;
  generalMessage?: string;
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
  items?: HeroItem[];
};

// ── Componente de estrellas ──────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, idx) => {
        const fill = Math.max(0, Math.min(1, rating - idx));
        return (
          <span key={idx} className="relative inline-block w-5 h-5">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <defs>
                <linearGradient
                  id={`sg-${idx}-${rating}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset={`${fill * 100}%`} stopColor="#FACC15" />
                  <stop offset={`${fill * 100}%`} stopColor="rgba(255,255,255,0.3)" />
                </linearGradient>
              </defs>
              <polygon
                points="12,2 15,9 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,9"
                fill={`url(#sg-${idx}-${rating})`}
                stroke="#FACC15"
                strokeWidth="0.8"
              />
            </svg>
          </span>
        );
      })}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
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
  googleMaps,
  generalMessage,
}: HeroSectionProps) {
  const bg = styles?.backgroundColor;
  const color = styles?.textColor;
  const textAlign: React.CSSProperties["textAlign"] = styles?.textAlign || "center";
  const borderRadius = styles?.borderRadius || "1.5rem";

  const placeId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLACE_ID;
  const hasGoogleMaps =
    googleMaps || (items && items.some((i) => i.googleMaps));
  const { data: googleMapsData } = useGoogleMapsPlaceDetails(placeId, hasGoogleMaps);

  // ── TODOS los hooks antes de cualquier return condicional ────────────────
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const heroItems: HeroItem[] = (
    items && items.length
      ? items.map((item) =>
          item.googleMaps && googleMapsData
            ? {
                ...item,
                rating: googleMapsData.rating,
                ratingCount: googleMapsData.user_ratings_total,
              }
            : item
        )
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

  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroItems.length);
  }, [heroItems.length]);

  const goToPrev = React.useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? heroItems.length - 1 : prev - 1
    );
  }, [heroItems.length]);

  // Autoplay
  React.useEffect(() => {
    if (heroItems.length <= 1) return;
    const id = setInterval(goToNext, 5000);
    return () => clearInterval(id);
  }, [heroItems.length, goToNext]);

  // Reset imageLoaded al cambiar de slide para aplicar fade-in en cada imagen
  React.useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  // ── Return condicional DESPUÉS de todos los hooks ────────────────────────
  if (!heroItems.length) return null;

  const current = heroItems[Math.min(currentIndex, heroItems.length - 1)];
  const currentFieldStyles = current.fieldStyles || {};

  const badgeStyle: React.CSSProperties = {
    ...(fieldStyles?.badge || {}),
    ...(currentFieldStyles.badge || {}),
  };
  const titleStyle: React.CSSProperties = {
    ...(fieldStyles?.title || {}),
    ...(currentFieldStyles.title || {}),
  };
  const subtitleStyle: React.CSSProperties = {
    ...(fieldStyles?.subtitle || {}),
    ...(currentFieldStyles.subtitle || {}),
  };
  const buttonTextStyle: React.CSSProperties = {
    ...(fieldStyles?.buttonText || {}),
    ...(currentFieldStyles.buttonText || {}),
  };

  return (
    <section
      style={{
        ...(bg ? { backgroundColor: bg } : {}),
        ...(color ? { color } : {}),
        paddingTop: 0,
        paddingBottom: 0,
        textAlign,
      }}
      className="px-0 sm:px-0 lg:px-0 py-0"
    >
      <div
        className="relative overflow-hidden w-full max-w-full aspect-[16/9] sm:aspect-[16/7] min-h-[220px] sm:min-h-[300px]"
        style={{ borderRadius }}
      >
        {/* Placeholder/skeleton mientras la imagen carga */}
        {current.image && !imageLoaded && (
          <div
            className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse"
            style={{ borderRadius }}
          />
        )}

        {/* Imagen de fondo con fade-in suave */}
        {current.image && (
          <img
            src={current.image}
            alt={current.title || "Hero"}
            width={1920}
            height={840}
            className="absolute inset-0 w-full h-full object-contain sm:object-cover"
            style={{
              borderRadius,
              opacity: imageLoaded ? 1 : 0,
              transition: "opacity 0.35s ease",
            }}
            draggable={false}
            decoding="async"
            loading="eager"
            onLoad={() => setImageLoaded(true)}
          />
        )}

        {/* Badge de Google Maps */}
        {current.googleMaps && (current.rating || current.ratingCount) && (
          <div className="absolute top-3 left-3 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg flex flex-col gap-1 max-w-[180px] sm:max-w-none">
            <div className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" className="flex-shrink-0">
                <path
                  fill="#4285F4"
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
                />
              </svg>
              <span className="text-xs font-bold text-slate-700 dark:text-white">Google</span>
              <span className="text-xs font-extrabold text-yellow-500">
                {current.rating?.toFixed(1)}
              </span>
            </div>
            <StarRating rating={current.rating ?? 0} />
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {current.ratingCount?.toLocaleString()} reseñas
            </span>
            {current.generalMessage && (
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                {current.generalMessage}
              </p>
            )}
          </div>
        )}

        {/* Flechas de navegación */}
        {heroItems.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-105"
            >
              <span className="material-icons-round text-lg sm:text-xl">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-105"
            >
              <span className="material-icons-round text-lg sm:text-xl">chevron_right</span>
            </button>
          </>
        )}

        {/* Contenido textual */}
        <div className="absolute left-0 right-0 bottom-0 z-20 flex flex-col items-start text-left gap-0 sm:gap-0 pb-1 px-2 sm:pb-4 sm:px-8 w-full max-w-full">
          {current.badge && (
            <span
              className="inline-block px-2 py-0.5 text-[9px] sm:px-3 sm:py-1 sm:text-xs font-bold tracking-widest uppercase bg-white/90 text-black dark:bg-slate-900/90 dark:text-white rounded-full shadow"
              style={badgeStyle}
            >
              {current.badge}
            </span>
          )}
          {current.title && (
            <h2
              className="text-2xl sm:text-5xl lg:text-5xl font-extrabold text-white leading-tight max-w-[90vw] sm:max-w-2xl drop-shadow-lg"
              style={titleStyle}
            >
              {current.title}
            </h2>
          )}
          {current.subtitle && (
            <p
              className="text-white/80 text-[11px] sm:text-sm max-w-[90vw] sm:max-w-xl drop-shadow"
              style={subtitleStyle}
            >
              {current.subtitle}
            </p>
          )}
          {current.buttonText && (
            <div className="w-full flex justify-center">
              <a
                href={current.buttonLink || "/products-by-category"}
                className="inline-flex items-center gap-1 sm:gap-2 bg-white/95 hover:bg-white text-black font-bold text-[11px] sm:text-sm px-3 py-1.5 sm:px-6 sm:py-1.5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
                style={buttonTextStyle}
              >
                <span>{current.buttonText}</span>
                <span className="material-icons-round text-xs sm:text-sm">arrow_forward</span>
              </a>
            </div>
          )}
        </div>

        {/* Dots indicadores */}
        {heroItems.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-20">
            {heroItems.map((_, i) => (
              <button
                key={i}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-5 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}