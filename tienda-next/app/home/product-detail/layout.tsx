import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tecnothings.ec";

// ISR: Revalidar cada 24 horas para detalles de productos
// Cachea la página por 1 día, luego regenera en background
export const revalidate = 86400;

// Permitir parámetros dinámicos
export const dynamicParams = true;

interface Props {
  searchParams: Promise<{ id?: string }>;
}

// generateMetadata no puede leer del cliente, pero podemos proporcionar metadata estándar
// y dejar que el cliente maneje OG tags dinámicos si es necesario
export const metadata: Metadata = {
  title: "Detalle del Producto | TecnoThings",
  description: "Información detallada del producto. PC Gamer y componentes gaming.",
  openGraph: {
    type: "website",
    url: `${SITE_URL}/home/product-detail`,
    title: "Producto | TecnoThings",
    description: "Información detallada del producto",
    images: [
      {
        url: `${SITE_URL}/default-product-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Producto",
      },
    ],
  },
};

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
