import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function ProductDetailPage({ searchParams }: Props) {
  const { id } = await searchParams;

  if (!id) {
    redirect("/products-by-category");
  }

  redirect(`/product-detail/${encodeURIComponent(id)}`);
}
