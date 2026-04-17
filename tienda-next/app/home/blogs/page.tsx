"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loading3DIcon } from "../../components/Loading3DIcon";
import { getPublishedBlogs } from "../../lib/blogs-db";
import { useTracking } from "../../lib/useAnalytics";
import type { Blog } from "../../lib/blog-types";

export default function HomeBlogsPage() {
  const router = useRouter();
  const { trackBlogClick } = useTracking();
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-slate-900 dark:text-white transition-colors px-4 py-14 lg:px-6">
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
        Blog
      </h1>
      <p className="mb-8 text-sm text-slate-600 dark:text-slate-300">
        Artículos recomendados para ti.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loading3DIcon type="blog" />
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
                onClick={() => {
                  trackBlogClick().catch(console.error);
                  router.push(`/home/blogs/${featured.id}`);
                }}
                className="w-full text-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col md:flex-row"
              >
                {featured.blocks?.some((b) => b.type === "image") && (
                  <div className="w-full md:w-1/3 h-40 md:h-auto flex-shrink-0">
                    {featured.blocks
                      .find((b) => b.type === "image")
                      ?.type === "image" && (
                      <img
                        src={
                          featured.blocks.find((b) => b.type === "image")?.type === "image"
                            ? featured.blocks.find((b) => b.type === "image")?.url
                            : ""
                        }
                        alt={
                          featured.blocks.find((b) => b.type === "image")?.type === "image"
                            ? featured.blocks.find((b) => b.type === "image")?.alt || featured.title
                            : ""
                        }
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                <div className="p-5 flex flex-col justify-center flex-1">
                  <h3 className="text-base font-bold mb-1">{featured.title}</h3>
                  {featured.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">
                      {featured.description}
                    </p>
                  )}
                  <div className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-300 mt-1 w-fit">
                    <span className="material-icons-round text-sm">visibility</span>
                    <span>Ver más</span>
                  </div>
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
                {others.map((b) => {
                  const imageBlock = b.blocks?.find((block) => block.type === "image");
                  return (
                    <article
                      key={b.id}
                      onClick={() => {
                        trackBlogClick().catch(console.error);
                        router.push(`/home/blogs/${b.id}`);
                      }}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition"
                    >
                      {imageBlock && imageBlock.type === "image" && (
                        <div className="w-full h-32 overflow-hidden">
                          <img
                            src={imageBlock.url}
                            alt={imageBlock.alt || b.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-sm font-semibold mb-1">{b.title}</h3>
                        {b.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-2 flex-1">
                            {b.description}
                          </p>
                        )}
                        <div className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-300 mt-auto">
                          <span className="material-icons-round text-sm">arrow_forward</span>
                          <span>Ver más</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
