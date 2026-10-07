import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CategoryView } from "@/components/storefront/CategoryView";

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await db.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const allCategories = await db.getCategories();
  const products = await db.getProducts({ categorySlug: slug });

  return (
    <CategoryView
      category={category}
      categories={allCategories}
      initialProducts={products}
    />
  );
}
