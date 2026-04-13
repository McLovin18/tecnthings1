"use client";


import BottomBarPublic from "./components/BottomBarPublic";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton";
import { useUser } from "./context/UserContext";

import { useEffect, useState, useRef } from "react";
import { getLandingPage } from "./lib/landing-db";
import ProductoCard from "./components/ProductoCard";
import { SectionRenderer } from "./landing/sectionRegistry";
import Hero360Section from "./landing/sections/Hero360Section";
import PlansSection from "./landing/sections/PlansSection";
import type { LandingSection } from "./lib/landing-types";
import { obtenerProductos } from "./lib/productos-db";
import { Loading3DIcon } from "./components/Loading3DIcon";

export default function Home() {
  const { isLogged } = useUser();
  const [landing, setLanding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<any[]>([]);
  const [showPlans, setShowPlans] = useState(false);
  const plansRef = useRef<HTMLDivElement>(null);

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
      <div className="flex items-center justify-center min-h-screen  sm:py-6">
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

  // Agregar Hero360 como sección estática ANTES de la última sección dinámica
  const maxOrder = Math.max(...sections.map((s) => s.order || 0), 0);
  const hero360Section: LandingSection = {
    id: "hero360-static",
    type: "hero360",
    order: maxOrder - 0.5, // Justo antes de la última sección dinámica
    props: {
      heading: "CONSTRUYE TU",
      subheading: "NUEVO EQUIPO",
      description: "Arma tu PC soñada. Nosotros te asesoramos para que juegues sin límites.",
      primaryButtonText: "ENSAMBLES",
      primaryButtonLink: "/products-by-category?cat=1775935501638&sub=1775935523162",
      secondaryButtonText: "ASESORAMIENTO",
      secondaryButtonLink: "https://wa.me/593962873167?text=Hola%20quiero%20asesoramiento%20para%20mi%20PC",
      backgroundImage: "/banner_img.jpeg",
      images: ["/img_1.png", "/img_2.png", "/img_3.png", "/img_4.png"],
      autoPlay: true,
      interval: 2000,
      onPrimaryButtonClick: () => {
        setShowPlans(!showPlans);
        // Hacer scroll hacia PlansSection después de mostrar
        setTimeout(() => {
          if (plansRef.current) {
            const elementPosition = plansRef.current.getBoundingClientRect().top + window.scrollY;
            // Restar 120px para dejar espacio del navbar y un margen adicional
            const offsetPosition = elementPosition - 120;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      },
    },
    styles: {},
    hidden: false,
  };

  // Insertar Hero360 en el array
  const allSections = [...sections, hero360Section];

  return (
    <>
      {/* Botón flotante de WhatsApp aún más arriba */}
      <WhatsAppFloatingButton />
      <div className="bg-white dark:bg-black text-slate-900 dark:text-white min-h-screen flex flex-col w-full">
        <main className="flex-1 w-full flex flex-col gap-0">
          {/* Todas las secciones incluyendo Hero360 renderizadas por orden */}
          {allSections
            .slice()
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((section) => (
              <div key={section.id}>
                <SectionRenderer section={section} />
                {/* Mostrar PlansSection después de Hero360 */}
                {section.id === "hero360-static" && showPlans && (
                  <div ref={plansRef}>
                    <PlansSection />
                  </div>
                )}
              </div>
            ))}
        </main>
      </div>
      {/* Mostrar BottomBarPublic solo si NO está autenticado */}
      {!isLogged && <BottomBarPublic />}
    </>
  );
}
