import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerProductoPorId } from "../../lib/productos-db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecnothings.com";

interface Props {
  params: Promise<{ id: string }>;
}

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await obtenerProductoPorId(id);

  if (!product) {
    return {
      title: "Producto no encontrado | TecnoThings",
      description: "El producto que buscas no existe o fue retirado.",
    };
  }

  const title = `${product.nombre} | TecnoThings`;
  const description = stripHtml(product.descripcion || `Compra ${product.nombre} en TecnoThings.`).slice(0, 160);
  const image = String(product.imagenes?.[0] || `${SITE_URL}/default-product-image.jpg`);
  const url = `${SITE_URL}/product-detail/${id}`;
  const stock = Number(product.stock || 0);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
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

export default async function PublicProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await obtenerProductoPorId(id);

  if (!product) notFound();

  const image = String(product.imagenes?.[0] || `${SITE_URL}/default-product-image.jpg`);
  const description = stripHtml(product.descripcion || "");
  const price = Number(product.precio || 0);
  const hasDiscount = Number(product.descuento || 0) > 0;
  const stock = Number(product.stock || 0);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nombre,
    image: [image],
    description: description || `Compra ${product.nombre} en TecnoThings.`,
    sku: product.sku || id,
    brand: {
      "@type": "Brand",
      name: "TecnoThings",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product-detail/${id}`,
      priceCurrency: "USD",
      price: price.toFixed(2),
        availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/products-by-category" className="hover:underline">Productos</Link>
          <span className="mx-2">/</span>
          <span>{product.nombre}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-[minmax(0,420px)_1fr] items-start">
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <img src={image} alt={product.nombre} className="w-full h-auto object-contain" loading="eager" />
          </div>

          <section>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{product.nombre}</h1>
            <p className="mt-3 text-slate-600 leading-relaxed">{description}</p>

            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-black text-[#7b68ee]">${price.toFixed(2)}</span>
              {hasDiscount && <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-semibold">Oferta</span>}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {stock > 0 ? "En stock" : "Sin stock"}
              </span>
            </div>

            <div className="mt-8 flex gap-3 flex-wrap">
              <Link href={`/product-detail?id=${id}`} className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#7b68ee] text-white font-semibold hover:bg-[#6d28d9] transition-colors">
                Ver detalle interactivo
              </Link>
              <Link href="/products-by-category" className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 transition-colors">
                Seguir explorando
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}