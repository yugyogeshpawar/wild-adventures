import fs from "fs";
import path from "path";
import { Category, Product, ProductFilterOptions, DashboardStats } from "../types";
import { initialCategories, initialProducts } from "./seed";
import { slugify } from "../utils";

export interface IDataStore {
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category | null>;
  deleteCategory(id: string): Promise<boolean>;

  getProducts(filters?: ProductFilterOptions): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  createProduct(product: Omit<Product, "id" | "createdAt">): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;

  getDashboardStats(): Promise<DashboardStats>;
  resetToSeed(): Promise<void>;
}

interface StoreSchema {
  categories: Category[];
  products: Product[];
}

class JsonDataStore implements IDataStore {
  private dataDir: string;
  private filePath: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), ".data");
    this.filePath = path.join(this.dataDir, "store.json");
  }

  private ensureData(): StoreSchema {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (!fs.existsSync(this.filePath)) {
        const initialData: StoreSchema = {
          categories: initialCategories,
          products: initialProducts,
        };
        fs.writeFileSync(this.filePath, JSON.stringify(initialData, null, 2), "utf-8");
        return initialData;
      }

      const content = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(content) as StoreSchema;
    } catch (err) {
      console.error("Error reading data store, falling back to seed:", err);
      return {
        categories: initialCategories,
        products: initialProducts,
      };
    }
  }

  private saveData(data: StoreSchema): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error persisting data store:", err);
    }
  }

  async getCategories(): Promise<Category[]> {
    const data = this.ensureData();
    return data.categories.sort((a, b) => (a.name.localeCompare(b.name)));
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const data = this.ensureData();
    return data.categories.find((c) => c.id === id) || null;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const data = this.ensureData();
    return data.categories.find((c) => c.slug === slug || c.slug === slugify(slug)) || null;
  }

  async createCategory(categoryData: Omit<Category, "id" | "createdAt">): Promise<Category> {
    const data = this.ensureData();
    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCategory: Category = {
      ...categoryData,
      id,
      slug: categoryData.slug ? slugify(categoryData.slug) : slugify(categoryData.name),
      createdAt: new Date().toISOString(),
    };
    data.categories.push(newCategory);
    this.saveData(data);
    return newCategory;
  }

  async updateCategory(id: string, updateData: Partial<Category>): Promise<Category | null> {
    const data = this.ensureData();
    const index = data.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const existing = data.categories[index];
    const updated: Category = {
      ...existing,
      ...updateData,
      slug: updateData.slug ? slugify(updateData.slug) : (updateData.name ? slugify(updateData.name) : existing.slug),
    };
    data.categories[index] = updated;
    this.saveData(data);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const data = this.ensureData();
    const prevLen = data.categories.length;
    data.categories = data.categories.filter((c) => c.id !== id);
    if (data.categories.length !== prevLen) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  async getProducts(filters?: ProductFilterOptions): Promise<Product[]> {
    const data = this.ensureData();
    let result = [...data.products];

    if (filters) {
      if (filters.categorySlug) {
        const cat = data.categories.find((c) => c.slug === filters.categorySlug);
        if (cat) {
          result = result.filter((p) => p.categoryId === cat.id);
        } else {
          // Check if product categoryId matches slug directly
          result = result.filter((p) => p.categoryId === filters.categorySlug);
        }
      }

      if (filters.categoryId && filters.categoryId !== "all") {
        result = result.filter((p) => p.categoryId === filters.categoryId);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      if (filters.inStock) {
        result = result.filter((p) => p.stock > 0);
      }

      if (typeof filters.minPrice === "number") {
        result = result.filter((p) => p.price >= filters.minPrice!);
      }

      if (typeof filters.maxPrice === "number") {
        result = result.filter((p) => p.price <= filters.maxPrice!);
      }

      if (filters.sort) {
        switch (filters.sort) {
          case "price-asc":
            result.sort((a, b) => a.price - b.price);
            break;
          case "price-desc":
            result.sort((a, b) => b.price - a.price);
            break;
          case "newest":
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case "featured":
            result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
            break;
        }
      }
    }

    return result;
  }

  async getProductById(id: string): Promise<Product | null> {
    const data = this.ensureData();
    return data.products.find((p) => p.id === id) || null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const data = this.ensureData();
    return data.products.find((p) => p.slug === slug || p.slug === slugify(slug)) || null;
  }

  async createProduct(productData: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const data = this.ensureData();
    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProduct: Product = {
      ...productData,
      id,
      slug: productData.slug ? slugify(productData.slug) : slugify(productData.name),
      createdAt: new Date().toISOString(),
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
    };
    data.products.push(newProduct);
    this.saveData(data);
    return newProduct;
  }

  async updateProduct(id: string, updateData: Partial<Product>): Promise<Product | null> {
    const data = this.ensureData();
    const index = data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = data.products[index];
    const updated: Product = {
      ...existing,
      ...updateData,
      slug: updateData.slug ? slugify(updateData.slug) : (updateData.name ? slugify(updateData.name) : existing.slug),
    };
    data.products[index] = updated;
    this.saveData(data);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const data = this.ensureData();
    const prevLen = data.products.length;
    data.products = data.products.filter((p) => p.id !== id);
    if (data.products.length !== prevLen) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const data = this.ensureData();
    const totalProducts = data.products.length;
    const activeCategories = data.categories.filter((c) => c.isActive).length;
    const lowStockCount = data.products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = data.products.filter((p) => p.stock === 0).length;
    const totalInventoryCount = data.products.reduce((acc, p) => acc + p.stock, 0);
    const totalInventoryValue = data.products.reduce((acc, p) => acc + p.price * p.stock, 0);

    return {
      totalProducts,
      activeCategories,
      lowStockCount,
      outOfStockCount,
      totalInventoryCount,
      totalInventoryValue,
    };
  }

  async resetToSeed(): Promise<void> {
    const initialData: StoreSchema = {
      categories: initialCategories,
      products: initialProducts,
    };
    this.saveData(initialData);
  }
}

// Singleton export
export const db: IDataStore = new JsonDataStore();
