export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  categoryId: string;
  categorySlug?: string;
  stock: number;
  images: string[];
  isFeatured: boolean;
  tags: string[];
  sku: string;
  createdAt: string;
  rating?: number | null;
  reviewCount?: number | null;
  materials?: string | null;
  dimensions?: string | null;
  specifications?: Record<string, unknown>;
}

export interface CartItem {
  id: string; // usually product.id
  product: Product;
  quantity: number;
}

export interface ProductFilterOptions {
  categoryId?: string;
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'featured';
}

export interface DashboardStats {
  totalProducts: number;
  activeCategories: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryCount: number;
  totalInventoryValue: number;
}
