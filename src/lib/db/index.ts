import mongoose from "mongoose";
import { Category, Product, ProductFilterOptions, DashboardStats } from "../types";
import { connectDB } from "./mongodb";
import { Category as CategoryModel } from "../models/Category";
import { Product as ProductModel } from "../models/Product";
import { slugify } from "../utils";
import fs from "fs";
import path from "path";

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

function toCategoryDTO(doc: any): Category {
  return {
    id: doc._id ? doc._id.toString() : doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description || "",
    imageUrl: doc.imageUrl || "",
    isActive: Boolean(doc.isActive),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : doc.createdAt || new Date().toISOString(),
  };
}

function toProductDTO(doc: any): Product {
  return {
    id: doc._id ? doc._id.toString() : doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description || "",
    price: Number(doc.price),
    compareAtPrice:
      doc.compareAtPrice !== null && doc.compareAtPrice !== undefined
        ? Number(doc.compareAtPrice)
        : null,
    categoryId: doc.categoryId ? doc.categoryId.toString() : "",
    categorySlug: doc.categorySlug || "",
    stock: Number(doc.stock ?? 0),
    images: Array.isArray(doc.images) ? doc.images : [],
    isFeatured: Boolean(doc.isFeatured),
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    sku: doc.sku || "",
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : doc.createdAt || new Date().toISOString(),
    rating:
      doc.rating !== null && doc.rating !== undefined ? Number(doc.rating) : 5.0,
    reviewCount:
      doc.reviewCount !== null && doc.reviewCount !== undefined
        ? Number(doc.reviewCount)
        : 1,
    materials: doc.materials || doc.specifications?.materials || "",
    dimensions: doc.dimensions || doc.specifications?.dimensions || "",
    specifications: doc.specifications || {},
  };
}

interface LocalStoreSchema {
  categories: Category[];
  products: Product[];
}

/**
 * Resilient local JSON data store used when MongoDB Atlas is offline or IP is unwhitelisted.
 */
class LocalFallbackDataStore implements IDataStore {
  private filePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), ".data", "store.json");
  }

  private getData(): LocalStoreSchema {
    try {
      if (fs.existsSync(this.filePath)) {
        return JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
      }
      const seedPath = path.join(process.cwd(), "src", "lib", "data", "seed-products.json");
      if (fs.existsSync(seedPath)) {
        return JSON.parse(fs.readFileSync(seedPath, "utf-8"));
      }
    } catch (e) {
      console.error("Error reading local store:", e);
    }
    return { categories: [], products: [] };
  }

  private saveData(data: LocalStoreSchema): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving local store:", e);
    }
  }

  async getCategories(): Promise<Category[]> {
    const data = this.getData();
    return data.categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const data = this.getData();
    return data.categories.find((c) => c.id === id || c.slug === id) || null;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const data = this.getData();
    return (
      data.categories.find(
        (c) => c.slug === slug || c.slug === slugify(slug)
      ) || null
    );
  }

  async createCategory(categoryData: Omit<Category, "id" | "createdAt">): Promise<Category> {
    const data = this.getData();
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
    const data = this.getData();
    const index = data.categories.findIndex((c) => c.id === id || c.slug === id);
    if (index === -1) return null;
    const existing = data.categories[index];
    const updated: Category = {
      ...existing,
      ...updateData,
      slug: updateData.slug ? slugify(updateData.slug) : existing.slug,
    };
    data.categories[index] = updated;
    this.saveData(data);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const data = this.getData();
    const prev = data.categories.length;
    data.categories = data.categories.filter((c) => c.id !== id && c.slug !== id);
    if (data.categories.length !== prev) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  async getProducts(filters?: ProductFilterOptions): Promise<Product[]> {
    const data = this.getData();
    let result = [...data.products];

    if (filters) {
      if (filters.categorySlug && filters.categorySlug !== "all") {
        const cat = data.categories.find(
          (c) => c.slug === filters.categorySlug || c.id === filters.categorySlug
        );
        if (cat) {
          result = result.filter(
            (p) => p.categoryId === cat.id || p.categorySlug === cat.slug
          );
        } else {
          result = result.filter(
            (p) => p.categorySlug === filters.categorySlug || p.categoryId === filters.categorySlug
          );
        }
      }

      if (filters.categoryId && filters.categoryId !== "all") {
        result = result.filter(
          (p) => p.categoryId === filters.categoryId || p.categorySlug === filters.categoryId
        );
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
    const data = this.getData();
    return data.products.find((p) => p.id === id || p.slug === id || p.sku === id) || null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const data = this.getData();
    return (
      data.products.find(
        (p) => p.slug === slug || p.slug === slugify(slug)
      ) || null
    );
  }

  async createProduct(productData: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const data = this.getData();
    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProduct: Product = {
      ...productData,
      id,
      slug: productData.slug ? slugify(productData.slug) : slugify(productData.name),
      createdAt: new Date().toISOString(),
      rating: productData.rating ?? 5.0,
      reviewCount: productData.reviewCount ?? 1,
    };
    data.products.push(newProduct);
    this.saveData(data);
    return newProduct;
  }

  async updateProduct(id: string, updateData: Partial<Product>): Promise<Product | null> {
    const data = this.getData();
    const index = data.products.findIndex((p) => p.id === id || p.slug === id);
    if (index === -1) return null;
    const existing = data.products[index];
    const updated: Product = {
      ...existing,
      ...updateData,
      slug: updateData.slug ? slugify(updateData.slug) : existing.slug,
    };
    data.products[index] = updated;
    this.saveData(data);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const data = this.getData();
    const prev = data.products.length;
    data.products = data.products.filter((p) => p.id !== id && p.slug !== id);
    if (data.products.length !== prev) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const data = this.getData();
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
    const seedPath = path.join(process.cwd(), "src", "lib", "data", "seed-products.json");
    if (fs.existsSync(seedPath)) {
      const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
      this.saveData(seedData);
    }
  }
}

/**
 * Primary DataStore backed by MongoDB Atlas with transparent fallback.
 */
class MongoDataStore implements IDataStore {
  private fallbackStore: LocalFallbackDataStore = new LocalFallbackDataStore();
  private hasWarned = false;

  private async tryMongo(): Promise<boolean> {
    try {
      await connectDB();
      return true;
    } catch (err: any) {
      if (!this.hasWarned) {
        console.warn(
          "[MongoDB Connection Note] Cluster unreachable (Atlas IP Access List or Network). Serving data with local fallback store.",
          err?.message || ""
        );
        this.hasWarned = true;
      }
      return false;
    }
  }

  async getCategories(): Promise<Category[]> {
    if (await this.tryMongo()) {
      try {
        const docs = await CategoryModel.find({}).sort({ name: 1 }).lean();
        return docs.map(toCategoryDTO);
      } catch {
        return this.fallbackStore.getCategories();
      }
    }
    return this.fallbackStore.getCategories();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    if (await this.tryMongo()) {
      try {
        let doc: any = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
          doc = await CategoryModel.findById(id).lean();
        }
        if (!doc) {
          doc = await CategoryModel.findOne({
            $or: [{ slug: id }, { slug: slugify(id) }],
          }).lean();
        }
        if (doc) return toCategoryDTO(doc);
      } catch {
        return this.fallbackStore.getCategoryById(id);
      }
    }
    return this.fallbackStore.getCategoryById(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (await this.tryMongo()) {
      try {
        const cleanSlug = slug.toLowerCase().trim();
        const doc = await CategoryModel.findOne({
          $or: [{ slug: cleanSlug }, { slug: slugify(cleanSlug) }],
        }).lean();
        if (doc) return toCategoryDTO(doc);
      } catch {
        return this.fallbackStore.getCategoryBySlug(slug);
      }
    }
    return this.fallbackStore.getCategoryBySlug(slug);
  }

  async createCategory(categoryData: Omit<Category, "id" | "createdAt">): Promise<Category> {
    if (await this.tryMongo()) {
      try {
        const slug = categoryData.slug
          ? slugify(categoryData.slug)
          : slugify(categoryData.name);

        const doc = await CategoryModel.create({
          name: categoryData.name.trim(),
          slug,
          description: categoryData.description || "",
          imageUrl: categoryData.imageUrl || "",
          isActive: categoryData.isActive ?? true,
        });

        // Also update local fallback for offline consistency
        await this.fallbackStore.createCategory(categoryData);
        return toCategoryDTO(doc);
      } catch {
        return this.fallbackStore.createCategory(categoryData);
      }
    }
    return this.fallbackStore.createCategory(categoryData);
  }

  async updateCategory(id: string, updateData: Partial<Category>): Promise<Category | null> {
    if (await this.tryMongo()) {
      try {
        const filter: Record<string, any> = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
          filter._id = new mongoose.Types.ObjectId(id);
        } else {
          filter.slug = id;
        }

        const payload: Record<string, any> = { ...updateData };
        if (updateData.name && !updateData.slug) {
          payload.slug = slugify(updateData.name);
        } else if (updateData.slug) {
          payload.slug = slugify(updateData.slug);
        }

        const updated = await CategoryModel.findOneAndUpdate(filter, payload, {
          new: true,
          runValidators: true,
        }).lean();

        if (updated && payload.slug) {
          await ProductModel.updateMany(
            { categoryId: updated._id },
            { categorySlug: updated.slug }
          );
        }

        await this.fallbackStore.updateCategory(id, updateData);
        if (updated) return toCategoryDTO(updated);
      } catch {
        return this.fallbackStore.updateCategory(id, updateData);
      }
    }
    return this.fallbackStore.updateCategory(id, updateData);
  }

  async deleteCategory(id: string): Promise<boolean> {
    if (await this.tryMongo()) {
      try {
        const filter: Record<string, any> = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
          filter._id = new mongoose.Types.ObjectId(id);
        } else {
          filter.slug = id;
        }

        const result = await CategoryModel.deleteOne(filter);
        await this.fallbackStore.deleteCategory(id);
        return result.deletedCount > 0;
      } catch {
        return this.fallbackStore.deleteCategory(id);
      }
    }
    return this.fallbackStore.deleteCategory(id);
  }

  async getProducts(filters?: ProductFilterOptions): Promise<Product[]> {
    if (await this.tryMongo()) {
      try {
        const query: Record<string, any> = {};

        if (filters) {
          if (filters.categorySlug && filters.categorySlug !== "all") {
            const cleanSlug = filters.categorySlug.toLowerCase().trim();
            const cat = await CategoryModel.findOne({
              $or: [{ slug: cleanSlug }, { slug: slugify(cleanSlug) }],
            }).lean();

            if (cat) {
              query.$or = [{ categorySlug: cleanSlug }, { categoryId: cat._id }];
            } else {
              query.categorySlug = cleanSlug;
            }
          }

          if (filters.categoryId && filters.categoryId !== "all") {
            if (mongoose.Types.ObjectId.isValid(filters.categoryId)) {
              query.categoryId = new mongoose.Types.ObjectId(filters.categoryId);
            } else {
              const cat = await CategoryModel.findOne({
                $or: [{ slug: filters.categoryId }, { slug: slugify(filters.categoryId) }],
              }).lean();
              if (cat) query.categoryId = cat._id;
            }
          }

          if (filters.search && filters.search.trim()) {
            const q = filters.search.trim();
            const regex = new RegExp(q, "i");
            query.$or = [
              { name: regex },
              { description: regex },
              { sku: regex },
              { tags: regex },
            ];
          }

          if (filters.inStock) {
            query.stock = { $gt: 0 };
          }

          if (
            typeof filters.minPrice === "number" ||
            typeof filters.maxPrice === "number"
          ) {
            query.price = {};
            if (typeof filters.minPrice === "number") query.price.$gte = filters.minPrice;
            if (typeof filters.maxPrice === "number") query.price.$lte = filters.maxPrice;
          }
        }

        let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
        if (filters?.sort) {
          switch (filters.sort) {
            case "price-asc":
              sortQuery = { price: 1 };
              break;
            case "price-desc":
              sortQuery = { price: -1 };
              break;
            case "newest":
              sortQuery = { createdAt: -1 };
              break;
            case "featured":
              sortQuery = { isFeatured: -1, createdAt: -1 };
              break;
          }
        }

        const docs = await ProductModel.find(query).sort(sortQuery).lean();
        return docs.map(toProductDTO);
      } catch {
        return this.fallbackStore.getProducts(filters);
      }
    }
    return this.fallbackStore.getProducts(filters);
  }

  async getProductById(id: string): Promise<Product | null> {
    if (await this.tryMongo()) {
      try {
        let doc: any = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
          doc = await ProductModel.findById(id).lean();
        }
        if (!doc) {
          doc = await ProductModel.findOne({
            $or: [{ slug: id }, { sku: id }],
          }).lean();
        }
        if (doc) return toProductDTO(doc);
      } catch {
        return this.fallbackStore.getProductById(id);
      }
    }
    return this.fallbackStore.getProductById(id);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (await this.tryMongo()) {
      try {
        const cleanSlug = slug.toLowerCase().trim();
        const doc = await ProductModel.findOne({
          $or: [{ slug: cleanSlug }, { slug: slugify(cleanSlug) }],
        }).lean();
        if (doc) return toProductDTO(doc);
      } catch {
        return this.fallbackStore.getProductBySlug(slug);
      }
    }
    return this.fallbackStore.getProductBySlug(slug);
  }

  async createProduct(productData: Omit<Product, "id" | "createdAt">): Promise<Product> {
    if (await this.tryMongo()) {
      try {
        let catDoc: any = null;
        if (mongoose.Types.ObjectId.isValid(productData.categoryId)) {
          catDoc = await CategoryModel.findById(productData.categoryId).lean();
        }
        if (!catDoc) {
          catDoc = await CategoryModel.findOne({
            $or: [
              { slug: productData.categoryId },
              { slug: productData.categorySlug || "" },
              { name: "Hand Bags" },
            ],
          }).lean();
        }
        if (!catDoc) catDoc = await CategoryModel.findOne({}).lean();

        const slug = productData.slug
          ? slugify(productData.slug)
          : slugify(productData.name);

        const doc = await ProductModel.create({
          name: productData.name.trim(),
          slug,
          description: productData.description || "",
          price: Number(productData.price),
          compareAtPrice: productData.compareAtPrice ?? null,
          categoryId: catDoc?._id || new mongoose.Types.ObjectId(),
          categorySlug: catDoc?.slug || "hand-bag",
          stock: Number(productData.stock ?? 0),
          images:
            productData.images && productData.images.length > 0
              ? productData.images
              : ["/images/products/handbags/classic-leather-tote.jpg"],
          isFeatured: Boolean(productData.isFeatured),
          tags: Array.isArray(productData.tags) ? productData.tags : [],
          sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
          materials: productData.materials || "",
          dimensions: productData.dimensions || "",
          specifications: productData.specifications || {
            materials: productData.materials || "",
            dimensions: productData.dimensions || "",
          },
          rating: productData.rating ?? 5.0,
          reviewCount: productData.reviewCount ?? 1,
        });

        await this.fallbackStore.createProduct(productData);
        return toProductDTO(doc);
      } catch {
        return this.fallbackStore.createProduct(productData);
      }
    }
    return this.fallbackStore.createProduct(productData);
  }

  async updateProduct(id: string, updateData: Partial<Product>): Promise<Product | null> {
    if (await this.tryMongo()) {
      try {
        const filter: Record<string, any> = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
          filter._id = new mongoose.Types.ObjectId(id);
        } else {
          filter.slug = id;
        }

        const payload: Record<string, any> = { ...updateData };
        if (updateData.name && !updateData.slug) {
          payload.slug = slugify(updateData.name);
        } else if (updateData.slug) {
          payload.slug = slugify(updateData.slug);
        }

        if (updateData.categoryId) {
          let catDoc: any = null;
          if (mongoose.Types.ObjectId.isValid(updateData.categoryId)) {
            catDoc = await CategoryModel.findById(updateData.categoryId).lean();
          } else {
            catDoc = await CategoryModel.findOne({ slug: updateData.categoryId }).lean();
          }
          if (catDoc) {
            payload.categoryId = catDoc._id;
            payload.categorySlug = catDoc.slug;
          }
        }

        const updated = await ProductModel.findOneAndUpdate(filter, payload, {
          new: true,
          runValidators: true,
        }).lean();

        await this.fallbackStore.updateProduct(id, updateData);
        if (updated) return toProductDTO(updated);
      } catch {
        return this.fallbackStore.updateProduct(id, updateData);
      }
    }
    return this.fallbackStore.updateProduct(id, updateData);
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (await this.tryMongo()) {
      try {
        const filter: Record<string, any> = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
          filter._id = new mongoose.Types.ObjectId(id);
        } else {
          filter.slug = id;
        }

        const result = await ProductModel.deleteOne(filter);
        await this.fallbackStore.deleteProduct(id);
        return result.deletedCount > 0;
      } catch {
        return this.fallbackStore.deleteProduct(id);
      }
    }
    return this.fallbackStore.deleteProduct(id);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    if (await this.tryMongo()) {
      try {
        const [
          totalProducts,
          activeCategories,
          lowStockCount,
          outOfStockCount,
          inventoryAgg,
        ] = await Promise.all([
          ProductModel.countDocuments(),
          CategoryModel.countDocuments({ isActive: true }),
          ProductModel.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
          ProductModel.countDocuments({ stock: 0 }),
          ProductModel.aggregate([
            {
              $group: {
                _id: null,
                totalCount: { $sum: "$stock" },
                totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
              },
            },
          ]),
        ]);

        return {
          totalProducts,
          activeCategories,
          lowStockCount,
          outOfStockCount,
          totalInventoryCount: inventoryAgg[0]?.totalCount || 0,
          totalInventoryValue: inventoryAgg[0]?.totalValue || 0,
        };
      } catch {
        return this.fallbackStore.getDashboardStats();
      }
    }
    return this.fallbackStore.getDashboardStats();
  }

  async resetToSeed(): Promise<void> {
    await this.fallbackStore.resetToSeed();
    if (await this.tryMongo()) {
      try {
        const seedPath = path.join(process.cwd(), "src", "lib", "data", "seed-products.json");
        if (fs.existsSync(seedPath)) {
          const rawSeed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
          await CategoryModel.deleteMany({});
          await ProductModel.deleteMany({});

          const categoryMap = new Map();
          for (const catData of rawSeed.categories) {
            const doc = await CategoryModel.create({
              name: catData.name,
              slug: catData.slug,
              description: catData.description || "",
              imageUrl: catData.imageUrl || "",
              isActive: catData.isActive ?? true,
            });
            categoryMap.set(catData.id, doc);
            categoryMap.set(catData.slug, doc);
          }

          const productsToInsert = [];
          for (const p of rawSeed.products) {
            let catDoc = categoryMap.get(p.categoryId) || categoryMap.get(p.categorySlug);
            if (!catDoc) {
              catDoc = categoryMap.get("cat_handbags") || Array.from(categoryMap.values())[0];
            }

            productsToInsert.push({
              name: p.name,
              slug: p.slug,
              description: p.description,
              price: p.price,
              compareAtPrice: p.compareAtPrice || null,
              categoryId: catDoc._id,
              categorySlug: catDoc.slug,
              stock: p.stock ?? 10,
              images: p.images?.length > 0 ? p.images : ["/images/products/handbags/classic-leather-tote.jpg"],
              isFeatured: p.isFeatured ?? false,
              tags: p.tags || [],
              sku: p.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
              materials: p.materials || "",
              dimensions: p.dimensions || "",
              specifications: {
                materials: p.materials || "",
                dimensions: p.dimensions || "",
                careInstructions: p.careInstructions || "",
              },
              rating: p.rating || 5.0,
              reviewCount: p.reviewCount || 1,
            });
          }

          await ProductModel.insertMany(productsToInsert);
        }
      } catch (e) {
        console.error("Error resetting Mongo to seed:", e);
      }
    }
  }
}

// Singleton export backed by MongoDB with transparent fallback
export const db: IDataStore = new MongoDataStore();
