import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecnothings.com";

export const metadata: Metadata = {
  title: "Blog de TecnoThings",
  description:
    "Noticias, tutoriales y guías sobre PC gamer, componentes y tecnología en TecnoThings.",
  alternates: {
    canonical: `${SITE_URL}/blogs`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blogs`,
    title: "Blog de TecnoThings",
    description:
      "Consejos, novedades y contenido útil sobre hardware y tecnología.",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "TecnoThings - Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog de TecnoThings",
    description:
      "Lee artículos y guías sobre tecnología, gaming y componentes.",
    images: [`${SITE_URL}/twitter-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}