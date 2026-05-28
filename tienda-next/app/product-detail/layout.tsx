import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecnothings.com";

export const metadata: Metadata = {
  title: "Detalle del producto | TecnoThings",
  description:
    "Revisa especificaciones, fotos, precio y productos relacionados en TecnoThings.",
  alternates: {
    canonical: `${SITE_URL}/product-detail`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/product-detail`,
    title: "Detalle del producto | TecnoThings",
    description:
      "Información detallada de productos, disponibilidad, precio y recomendaciones.",
    images: [
      {
        url: `${SITE_URL}/default-product-image.jpg`,
        width: 1200,
        height: 630,
        alt: "TecnoThings - Detalle de producto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Detalle del producto | TecnoThings",
    description:
      "Consulta el detalle del producto antes de comprar en TecnoThings.",
    images: [`${SITE_URL}/default-product-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}