import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ProductFilterOptions } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const categorySlug = searchParams.get("categorySlug") || undefined;
    const search = searchParams.get("search") || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const inStock = searchParams.get("inStock") === "true" ? true : undefined;
    const sort = (searchParams.get("sort") as ProductFilterOptions["sort"]) || undefined;

    const products = await db.getProducts({
      categoryId,
      categorySlug,
      search,
      minPrice,
      maxPrice,
      inStock,
      sort,
    });

    return NextResponse.json({ success: true, data: products, count: products.length });
  } catch (error) {
    console.error("API Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.price || !body.categoryId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, price, categoryId" },
        { status: 400 }
      );
    }

    const newProduct = await db.createProduct({
      name: body.name,
      slug: body.slug,
      description: body.description || "",
      price: Number(body.price),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      categoryId: body.categoryId,
      stock: Number(body.stock ?? 0),
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ["/images/products/handbags/classic-leather-tote.jpg"],
      isFeatured: Boolean(body.isFeatured),
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(",").map((s: string) => s.trim()) : []),
      sku: body.sku || `SKU-${Date.now().toString().slice(-6)}`,
      materials: body.materials,
      dimensions: body.dimensions,
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    console.error("API Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
