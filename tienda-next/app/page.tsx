"use client";

import { useEffect, useState } from "react";
import CategoriesBar from "./components/CategoriesBar";
import { getLandingPage } from "./lib/landing-db";
import ProductoCard from "./components/ProductoCard";
import { SectionRenderer } from "./landing/sectionRegistry";
import type { LandingSection } from "./lib/landing-types";
import { obtenerProductos } from "./lib/productos-db";

export default function Home() {
  const [landing, setLanding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [landingData, productosData] = await Promise.all([
        getLandingPage(),
        obtenerProductos(),
      ]);
      setLanding(landingData);
      setProductos(productosData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-icons-round animate-spin text-4xl">sync</span>
        <span className="ml-4 text-slate-500 dark:text-white">Cargando landing...</span>
      </div>
    );
  }

  // Map featuredProducts (ids) to full product objects
  const destacados = (landing?.featuredProducts || [])
    .map((id: string) => productos.find((p) => p.id === id))
    .filter(Boolean);

  // Normalizar secciones a LandingSection (migrando legacy si hace falta)
  const rawSections: any[] = landing?.sections || [];
  const sections: LandingSection[] = rawSections.map((s: any, index: number) => {
    let base: LandingSection;
    if (s && s.props) {
      base = s as LandingSection;
    } else {
      base = {
        id: s.id || `section-${index}`,
        type: s.type || "banner",
        props: {
          title: s.title,
          subtitle: s.subtitle,
          content: s.content,
          image: s.image || s.imageUrl || null,
        },
        styles: {},
        order: s.order ?? index + 1,
        hidden: false,
      };
    }

    // Si la sección es de tipo featuredProducts, inyectamos los
    // productos destacados resueltos desde Firestore.
    if (base.type === "featuredProducts") {
      return {
        ...base,
        props: {
          ...(base.props || {}),
          products: destacados,
        },
      };
    }

    return base;
  });

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen flex flex-col">
      <CategoriesBar />
      <main className="flex-1 pb-24 lg:pb-0">
        {/* Todas las secciones se renderizan de forma dinámica desde Firestore */}
        {sections
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
      </main>
    </div>
  );
}
