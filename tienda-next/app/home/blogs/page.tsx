"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublishedBlogs } from "../../lib/blogs-db";
import type { Blog } from "../../lib/blog-types";

export default function HomeBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getPublishedBlogs();
      setBlogs(data);
      setLoading(false);
    }
    load();
  }, []);

  const featured = blogs.find((b) => b.featured);
  const others = blogs.filter((b) => !b.featured);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white transition-colors px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
        Blog
      </h1>
      <p className="mb-8 text-sm text-slate-600 dark:text-slate-300">
        Artículos recomendados para ti.
      </p>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Cargando artículos...
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No hay artículos disponibles todavía.
        </div>
      ) : (
        <>
          {featured && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                Blog destacado
              </h2>
              <button
                type="button"
                onClick={() => router.push(`/home/blogs/${featured.id}`)}
                className="w-full text-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
              >
                <h3 className="text-base font-bold mb-1">{featured.title}</h3>
                {featured.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-3">
                    {featured.description}
                  </p>
                )}
                <div className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-300 mt-1">
                  <span className="material-icons-round text-sm">visibility</span>
                  <span>Ver más</span>
                </div>
              </button>
            </section>
          )}

          {others.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                Todos los artículos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {others.map((b) => (
                  <article
                    key={b.id}
                    onClick={() => router.push(`/home/blogs/${b.id}`)}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    <h3 className="text-sm font-semibold mb-1">{b.title}</h3>
                    {b.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-3">
                        {b.description}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
