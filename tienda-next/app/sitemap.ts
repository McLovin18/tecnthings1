import { MetadataRoute } from 'next';
import { createFullProductSlug } from './lib/slug';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tecnothings.com';

function toValidDate(value: unknown): Date {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    value = value.toDate();
  } else if (value && typeof value === 'object' && '_seconds' in value) {
    const timestamp = value as { _seconds: unknown; _nanoseconds?: unknown };
    const seconds = Number(timestamp._seconds);
    const nanoseconds = Number(timestamp._nanoseconds || 0);
    value = new Date(seconds * 1000 + nanoseconds / 1_000_000);
  } else if (typeof value === 'number') {
    value = new Date(value);
  }

  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    // Rutas estáticas principales
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/politicas`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Importar Firebase Admin dinámicamente para evitar errores en tiempo de import
    let db: any = null;
    try {
      const adminModule = await import('./lib/firebase-admin');
      const { getFirestore } = await import('firebase-admin/firestore');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      db = getFirestore(adminModule.default.app());
    } catch (initError) {
      console.warn('Firebase Admin no disponible para sitemap (fallback a rutas estáticas):', initError);
      db = null;
    }

    if (db) {
      // Agregar URLs dinámicas de productos
      const productosSnapshot = await db.collection('productos').get();
      const productosUrls = productosSnapshot.docs.map((doc: any) => ({
        url: `${BASE_URL}/product-detail/${createFullProductSlug(doc.data().nombre, doc.id)}`,
        lastModified: toValidDate(doc.data().updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
      routes.push(...productosUrls);

      // Agregar URLs dinámicas de blogs publicados
      const blogsSnapshot = await db
        .collection('blogs')
        .where('status', '==', 'published')
        .get();
      const blogsUrls = blogsSnapshot.docs.map((doc: any) => ({
        url: `${BASE_URL}/blogs/${doc.id}`,
        lastModified: toValidDate(doc.data().updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
      routes.push(...blogsUrls);

      // Agregar URLs dinámicas de categorías
      const categoriasSnapshot = await db.collection('categorias').get();
      // Helper to XML-escape values placed inside <loc>
      const escapeXml = (s: string) =>
        s
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

      const categoriasUrls = categoriasSnapshot.docs
        .map((doc: any) => {
          const urls: any[] = [];
          const categoria = doc.data();

          // URL principal de la categoría (use URL+searchParams to encode params)
          try {
            const u = new URL(`${BASE_URL}/products-by-category`);
            u.searchParams.set('cat', String(doc.id));
            urls.push({
              url: escapeXml(u.toString()),
              lastModified: toValidDate(categoria.updatedAt),
              changeFrequency: 'weekly' as const,
              priority: 0.7,
            });

            // URLs de subcategorías
            if (categoria.subcategorias && Array.isArray(categoria.subcategorias)) {
              categoria.subcategorias.forEach((sub: any) => {
                const us = new URL(`${BASE_URL}/products-by-category`);
                us.searchParams.set('cat', String(doc.id));
                us.searchParams.set('sub', String(sub.id));
                urls.push({
                  url: escapeXml(us.toString()),
                  lastModified: toValidDate(categoria.updatedAt),
                  changeFrequency: 'weekly' as const,
                  priority: 0.6,
                });

                if (sub.subcategorias && Array.isArray(sub.subcategorias)) {
                  sub.subcategorias.forEach((subsub: any) => {
                    const uss = new URL(`${BASE_URL}/products-by-category`);
                    uss.searchParams.set('cat', String(doc.id));
                    uss.searchParams.set('sub', String(sub.id));
                    uss.searchParams.set('subsub', String(subsub.id));
                    urls.push({
                      url: escapeXml(uss.toString()),
                      lastModified: toValidDate(categoria.updatedAt),
                      changeFrequency: 'weekly' as const,
                      priority: 0.55,
                    });
                  });
                }
              });
            }
          } catch (uErr) {
            console.error('Error construyendo URLs de categoría:', uErr);
          }

          return urls;
        })
        .flat();
      routes.push(...categoriasUrls);
    }
  } catch (error) {
    console.error('Error generando sitemap dinámico (se devolverán solo rutas estáticas):', error);
  }

  return routes;
}
