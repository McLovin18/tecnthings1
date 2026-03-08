"use client";

import React from "react";
import type { Blog, BlogBlock } from "../lib/blog-types";

export type BlogPreviewProps = {
  blog: Blog;
  device: "desktop" | "mobile";
};

function renderBlock(block: BlogBlock, index: number) {
  if (block.type === "subtitle") {
    return (
      <h2
        key={block.id || index}
        className="text-xl md:text-2xl font-semibold mt-6 mb-2"
        style={block.style}
      >
        {block.text}
      </h2>
    );
  }
  if (block.type === "paragraph") {
    return (
      <p
        key={block.id || index}
        className="text-sm md:text-base leading-relaxed mb-4"
        style={block.style}
      >
        {block.text}
      </p>
    );
  }
  if (block.type === "image") {
    return (
      <figure
        key={block.id || index}
        className="my-4 flex flex-col items-center"
        style={block.style}
      >
        {block.url && (
          <img
            src={block.url}
            alt={block.alt || "Imagen del blog"}
            className="w-full rounded-xl max-h-[420px] object-cover"
          />
        )}
        {block.caption && (
          <figcaption className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  return null;
}

export default function BlogPreview({ blog, device }: BlogPreviewProps) {
  const wrapperClass =
    device === "mobile"
      ? "w-[390px] max-w-full mx-auto"
      : "w-full max-w-3xl mx-auto";

  return (
    <article className={wrapperClass}>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
          {blog.title || "(Sin título)"}
        </h1>
        {blog.description && (
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
            {blog.description}
          </p>
        )}
      </header>
      <section>
        {Array.isArray(blog.blocks) && blog.blocks.length > 0 ? (
          blog.blocks.map(renderBlock)
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Agrega párrafos, subtítulos o imágenes para construir el contenido del
            blog.
          </p>
        )}
      </section>
    </article>
  );
}
