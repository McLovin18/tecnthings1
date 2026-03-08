"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBlogById } from "../../../lib/blogs-db";
import type { Blog } from "../../../lib/blog-types";
import BlogPreview from "../../../blogs/BlogPreview";

export default function HomeBlogDetailPage() {
  const params = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      setLoading(true);
      const data = await getBlogById(params.id as string);
      setBlog(data);
      setLoading(false);
    }
    load();
  }, [params?.id]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white transition-colors px-4 py-6 lg:px-6">
      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Cargando artículo...
        </div>
      ) : !blog ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Artículo no encontrado.
        </div>
      ) : (
        <BlogPreview blog={blog} device="desktop" />
      )}
    </div>
  );
}
