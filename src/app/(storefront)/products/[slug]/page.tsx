import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductDetailView } from "@/components/storefront/ProductDetailView";

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = await db.getCategoryById(product.categoryId);
  const categoryProducts = await db.getProducts({ categoryId: product.categoryId });
  const relatedProducts = categoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <ProductDetailView
      product={product}
      category={category}
      relatedProducts={relatedProducts}
    />
  );
}
