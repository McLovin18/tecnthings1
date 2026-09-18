import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  obtenerProductoPorId,
  obtenerProductosPorCategoria,
  obtenerProductosPorSubcategoria,
  obtenerProductosPorSubsubcategoria,
} from "../../../lib/productos-db";
import ProductDetailClient from "../ProductDetailClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecnothings.com";

interface Props {
  params: Promise<{ slug: string }>;
}

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Extraer el ID del slug (formato: nombre-producto-id)
function extractIdFromSlug(slug: string): string | null {
  // El slug tiene el formato: nombre-del-producto-id
  // Buscamos el último segmento que sea el ID
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Verificar si el último segmento parece un ID (formato típico de Firebase)
  if (lastPart && lastPart.length >= 20) {
    return lastPart;
  }
  
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const productId = extractIdFromSlug(slug);

  if (!productId) {
    return {
      title: "Detalle del Producto | TecnoThings",
      description: "Información detallada del producto en TecnoThings.",
    };
  }

  const product = await obtenerProductoPorId(productId);

  if (!product) {
    return {
      title: "Producto no encontrado | TecnoThings",
      description: "El producto que buscas no existe o fue retirado.",
    };
  }

  const title = `${product.nombre} | TecnoThings`;
  const description = stripHtml(product.descripcion || `Compra ${product.nombre} en TecnoThings.`).slice(0, 160);
  const image = String(product.imagenes?.[0] || `${SITE_URL}/default-product-image.jpg`);
  const canonical = `${SITE_URL}/home/product-detail/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: product.nombre }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const productId = extractIdFromSlug(slug);

  if (!productId) {
    notFound();
  }

  const product = await obtenerProductoPorId(productId);

  if (!product) {
    notFound();
  }

  let related = [] as any[];

  if (product.subsubcategoria && product.subcategoria && product.categoria) {
    related = await obtenerProductosPorSubsubcategoria(product.subsubcategoria, product.subcategoria, product.categoria, null, { incluirSinStock: false });
  }

  if ((!related || related.length === 0) && product.subcategoria && product.categoria) {
    related = await obtenerProductosPorSubcategoria(product.subcategoria, product.categoria, null, { incluirSinStock: false });
  }

  if ((!related || related.length === 0) && product.categoria) {
    related = await obtenerProductosPorCategoria(product.categoria, null, { incluirSinStock: false });
  }

  related = (related || []).filter((item) => item.id !== product.id);

  return <ProductDetailClient product={product} relatedProducts={related} />;
}
