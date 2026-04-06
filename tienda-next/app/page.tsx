"use client";


import BottomBarPublic from "./components/BottomBarPublic";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton";
import { useUser } from "./context/UserContext";

import { useEffect, useState } from "react";
import { getLandingPage } from "./lib/landing-db";
import ProductoCard from "./components/ProductoCard";
import { SectionRenderer } from "./landing/sectionRegistry";
import type { LandingSection } from "./lib/landing-types";
import { obtenerProductos } from "./lib/productos-db";
import { Loading3DIcon } from "./components/Loading3DIcon";

export default function Home() {
  const { isLogged } = useUser();
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
        <Loading3DIcon />
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
    <>
      {/* Botón flotante de WhatsApp aún más arriba */}
      <WhatsAppFloatingButton />
      <div className="bg-white dark:bg-black text-slate-900 dark:text-white min-h-screen flex flex-col py-6 sm:py-15">
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
      {/* Mostrar BottomBarPublic solo si NO está autenticado */}
      {!isLogged && <BottomBarPublic />}
    </>
  );
}
