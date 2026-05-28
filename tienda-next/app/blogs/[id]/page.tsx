import { notFound } from "next/navigation";
import { getBlogById } from "../../lib/blogs-db";
import type { Blog } from "../../lib/blog-types";
import BlogPreview from "../BlogPreview";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;
  const blog = (await getBlogById(id)) as Blog | null;

  if (!blog) {
    notFound();
  }

  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--text)",
      }}
      className="min-h-screen flex flex-col"
    >
      <main className="max-w-3xl mx-auto px-4 py-8 lg:px-6 flex-1 w-full">
        <BlogPreview blog={blog} device="desktop" />
      </main>
    </div>
  );
}
