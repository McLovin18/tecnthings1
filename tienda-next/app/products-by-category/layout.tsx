import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecnothings.com";

export const metadata: Metadata = {
  title: "Productos por categoría | TecnoThings",
  description:
    "Explora computadoras, componentes y periféricos por categoría, subcategoría o marca en TecnoThings.",
  alternates: {
    canonical: `${SITE_URL}/products-by-category`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/products-by-category`,
    title: "Productos por categoría | TecnoThings",
    description:
      "Encuentra productos por categoría, subcategoría y rango de precio en TecnoThings.",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "TecnoThings - Productos por categoría",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Productos por categoría | TecnoThings",
    description:
      "Explora productos por categoría y encuentra el componente o equipo que necesitas.",
    images: [`${SITE_URL}/twitter-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProductsByCategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}