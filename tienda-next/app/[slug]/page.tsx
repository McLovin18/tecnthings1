import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  obtenerProductoPorId,
  obtenerProductoPorSlug,
  obtenerProductosPorCategoria,
  obtenerProductosPorSubcategoria,
  obtenerProductosPorSubsubcategoria,
} from "../lib/productos-db";
import ProductDetailClient from "../home/product-detail/ProductDetailClient";
import CategoryPageClient from "./CategoryPageClient";
import { parseCategorySlug } from "../lib/slug";
import { findCategoryIdBySlug, findSubcategoryIdBySlug, findSubsubcategoryIdBySlug, obtenerCategorias } from "../lib/categorias-db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecnothings.com";

interface Props {
  params: Promise<{ slug: string }>;
}

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Try to find product by slug first
  const product = await obtenerProductoPorSlug(slug);
  
  if (product) {
    const title = `${product.nombre} | TecnoThings`;
    const description = stripHtml(product.descripcion || `Compra ${product.nombre} en TecnoThings.`).slice(0, 160);
    const image = String(product.imagenes?.[0] || `${SITE_URL}/default-product-image.jpg`);
    const url = `${SITE_URL}/${slug}`;

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

  // It's a category - get category name for SEO
  const { category, subcategory, subsubcategory } = parseCategorySlug(slug);
  
  if (category) {
    const categorias = await obtenerCategorias();
    const catMap: any = {};
    const subcatMap: any = {};
    const subsubcatMap: any = {};
    
    categorias.forEach((cat: any) => {
      catMap[cat.id] = cat.nombre;
      if (cat.subcategorias) {
        cat.subcategorias.forEach((sub: any) => {
          subcatMap[sub.id] = sub.nombre;
          if (sub.subcategorias) {
            sub.subcategorias.forEach((subsub: any) => {
              subsubcatMap[subsub.id] = subsub.nombre;
            });
          }
        });
      }
    });
    
    // Resolve IDs to get names
    const categoriaId = await findCategoryIdBySlug(category);
    let categoriaNombre = "";
    let subcategoriaNombre = "";
    let subsubcategoriaNombre = "";
    
    if (categoriaId) {
      categoriaNombre = catMap[categoriaId] || category;
      
      if (subcategory) {
        const subResult = await findSubcategoryIdBySlug(category, subcategory);
        if (subResult) {
          subcategoriaNombre = subcatMap[subResult.subcategoryId] || subcategory;
        }
      }
      
      if (subcategory && subsubcategory) {
        const subsubResult = await findSubsubcategoryIdBySlug(category, subcategory, subsubcategory);
        if (subsubResult) {
          subsubcategoriaNombre = subsubcatMap[subsubResult.subsubcategoryId] || subsubcategory;
        }
      }
    }
    
    // Fallback: use slug parts if names not found
    const finalCategoriaNombre = categoriaNombre || category;
    const finalSubcategoriaNombre = subcategoriaNombre || subcategory;
    const finalSubsubcategoriaNombre = subsubcategoriaNombre || subsubcategory;
    
    const categoryName = finalSubsubcategoriaNombre || finalSubcategoriaNombre || finalCategoriaNombre;
    
    // Build title with proper formatting
    const title = categoryName ? `${categoryName} | TecnoThings` : "TecnoThings";
    const description = categoryName 
      ? `Explora nuestra selección de ${categoryName} en TecnoThings.`
      : "Explora nuestros productos en TecnoThings.";
    
    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/${slug}` },
      openGraph: {
        type: "website",
        url: `${SITE_URL}/${slug}`,
        title,
        description,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      robots: { index: true, follow: true },
    };
  }

  // Default metadata
  return {
    title: "TecnoThings",
    description: "Explora nuestros productos.",
  };
}

export default async function RootSlugPage({ params }: Props) {
  const { slug } = await params;
  
  // Try to find product by slug first
  const product = await obtenerProductoPorSlug(slug);
  
  if (product) {
    // It's a product - show product detail
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

    // Convert Firebase Timestamps to plain values to avoid "toJSON method not supported" error
    const plainProduct = JSON.parse(JSON.stringify(product));
    const plainRelated = related.map((item) => JSON.parse(JSON.stringify(item)));

    return <ProductDetailClient product={plainProduct} relatedProducts={plainRelated} />;
  }
  
  // It's a category slug - resolve IDs and render category page
  const { category, subcategory, subsubcategory } = parseCategorySlug(slug);
  
  if (category) {
    let categoriaId = "";
    let subcategoriaId = "";
    let subsubcategoriaId = "";
    
    categoriaId = await findCategoryIdBySlug(category) || "";
    
    if (category && subcategory && categoriaId) {
      const subResult = await findSubcategoryIdBySlug(category, subcategory);
      if (subResult) {
        subcategoriaId = subResult.subcategoryId;
      }
    }
    
    if (category && subcategory && subsubcategory && categoriaId && subcategoriaId) {
      const subsubResult = await findSubsubcategoryIdBySlug(category, subcategory, subsubcategory);
      if (subsubResult) {
        subsubcategoriaId = subsubResult.subsubcategoryId;
      }
    }
    
    // Fetch products for this category
    let productos: any[] = [];
    if (subsubcategoriaId && subcategoriaId && categoriaId) {
      productos = await obtenerProductosPorSubsubcategoria(subsubcategoriaId, subcategoriaId, categoriaId);
    } else if (subcategoriaId && categoriaId) {
      productos = await obtenerProductosPorSubcategoria(subcategoriaId, categoriaId);
    } else if (categoriaId) {
      productos = await obtenerProductosPorCategoria(categoriaId);
    }
    
    // Convert Firebase Timestamps to plain values
    const plainProductos = productos.map((item) => JSON.parse(JSON.stringify(item)));
    
    return (
      <CategoryPageClient 
        productos={plainProductos}
        categoriaId={categoriaId}
        subcategoriaId={subcategoriaId}
        subsubcategoriaId={subsubcategoriaId}
        slug={slug}
      />
    );
  }
  
  // If neither product nor category, 404
  notFound();
}
