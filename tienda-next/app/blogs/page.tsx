"use client";

import { useEffect, useState } from "react";
import CategoriesBar from "../components/CategoriesBar";
import { getPublishedBlogs } from "../lib/blogs-db";
import type { Blog } from "../lib/blog-types";

export default function BlogsPage() {
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
    <div
      style={{
        background: "var(--bg)",
        color: "var(--text)",
      }}
      className="min-h-screen flex flex-col"
    >
      <CategoriesBar />
      <main className="max-w-6xl mx-auto px-4 py-8 lg:px-6 flex-1">
        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>
          Blog de Tecno Things
        </h1>
        <p
          className="mb-12"
          style={{ color: "var(--textSecondary)" }}
        >
          Artículos, tutoriales y noticias sobre tecnología
        </p>

        {loading ? (
          <div className="text-center py-12">
            <span
              className="material-icons-round animate-spin text-4xl"
              style={{ color: "var(--textSecondary)" }}
            >
              sync
            </span>
            <p className="mt-4" style={{ color: "var(--textSecondary)" }}>
              Cargando artículos...
            </p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <span
              className="material-icons-round text-6xl opacity-30"
              style={{ color: "var(--textSecondary)" }}
            >
              article
            </span>
            <h3 className="text-xl font-semibold mt-4" style={{ color: "var(--text)" }}>
              No hay artículos disponibles
            </h3>
          </div>
        ) : (
          <>
            {featured && (
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Blog destacado</h2>
                <button
                  type="button"
                  onClick={() => router.push(`/blogs/${featured.id}`)}
                  className="w-full text-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <h3 className="text-xl font-bold mb-2">{featured.title}</h3>
                  {featured.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      {featured.description}
                    </p>
                  )}
                  <div className="inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-300 mt-1">
                    <span className="material-icons-round text-base">visibility</span>
                    <span>Leer artículo completo</span>
                  </div>
                </button>
              </section>
            )}

            {others.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Todos los artículos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {others.map((b) => (
                    <article
                      key={b.id}
                      onClick={() => router.push(`/blogs/${b.id}`)}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition"
                    >
                      <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                      {b.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-3">
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
      </main>
    </div>
  );
}
