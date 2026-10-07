"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { Product, Category } from "@/lib/types";
import {
  ADMIN_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  validateCredentials,
  createSessionToken,
} from "@/lib/auth";

// --- AUTH ACTIONS ---
export async function adminLoginAction(password: string, username = "admin") {
  try {
    const isValid = validateCredentials(password, username);
    if (!isValid) {
      return { success: false, error: "Invalid authentication credentials" };
    }

    const token = await createSessionToken(username);
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Authentication failed" };
  }
}

export async function adminLogoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Logout failed" };
  }
}

// --- CATEGORY ACTIONS ---
export async function createCategoryAction(data: Omit<Category, "id" | "createdAt">) {
  try {
    const category = await db.createCategory(data);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateCategoryAction(id: string, data: Partial<Category>) {
  try {
    const updated = await db.updateCategory(id, data);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const success = await db.deleteCategory(id);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}

// --- PRODUCT ACTIONS ---
export async function createProductAction(data: Omit<Product, "id" | "createdAt">) {
  try {
    const product = await db.createProduct(data);
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidatePath(`/categories/${product.categoryId}`);
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function updateProductAction(id: string, data: Partial<Product>) {
  try {
    const updated = await db.updateProduct(id, data);
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    if (updated?.slug) revalidatePath(`/products/${updated.slug}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const success = await db.deleteProduct(id);
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete product" };
  }
}

export async function resetDatabaseAction() {
  try {
    await db.resetToSeed();
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reset database" };
  }
}
