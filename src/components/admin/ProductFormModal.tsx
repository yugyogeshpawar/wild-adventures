"use client";

import * as React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product, Category } from "@/lib/types";
import { createProductAction, updateProductAction } from "@/app/actions";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { slugify } from "@/lib/utils";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  onSuccess?: () => void;
}

const PRESET_HANDBAG_IMAGES = [
  // Handbags & Totes
  "/images/products/handbags/classic-leather-tote.jpg",
  "/images/products/handbags/saddle-crossbody-bag.jpg",
  "/images/products/handbags/quilted-evening-shoulder-bag.jpg",
  "/images/products/handbags/canvas-everyday-satchel.jpg",
  "/images/products/handbags/minimalist-leather-bucket-bag.jpg",
  "/images/products/handbags/structured-top-handle-bag.jpg",
  "/images/products/handbags/woven-luxury-hobo-bag.jpg",
  "/images/products/handbags/croc-embossed-baguette.jpg",
  "/images/products/handbags/artisan-leather-duffle-mini.jpg",
  "/images/products/handbags/pleated-leather-pouch.jpg",
  "/images/products/handbags/chain-strap-flap-bag.jpg",
  "/images/products/handbags/vintage-envelope-satchel.jpg",
  "/images/products/handbags/parisienne-crescent-bag.jpg",
  "/images/products/handbags/soft-nappa-tote.jpg",
  "/images/products/handbags/monogram-clutch-wallet.jpg",
  "/images/products/handbags/sculptural-geometric-bag.jpg",
  // Travel & Duffels (Extracted from Catalogue PDF)
  "/images/products/handbags/classic-tan-vegan-leather-duffel.jpg",
  "/images/products/handbags/two-tone-premium-travel-bag.jpg",
  "/images/products/handbags/grey-cylindrical-duffel-with-striped-webbing.jpg",
  "/images/products/handbags/pastel-green-cylindrical-duffel.jpg",
  "/images/products/handbags/pastel-sage-cylindrical-weekender.jpg",
  "/images/products/handbags/orange-cylindrical-gym-duffel.jpg",
  "/images/products/handbags/pink-cylindrical-gym-duffel.jpg",
  "/images/products/handbags/premium-grey-duffel-bag.jpg",
  "/images/products/handbags/floral-premium-travel-duffel.jpg",
  "/images/products/handbags/multi-compartment-sports-travel-bag.jpg",
  // Half-Round Travel Bags (Extracted from Half Round PDF)
  "/images/products/handbags/half-round-half-round-bag-black-red-classic.jpg",
  "/images/products/handbags/half-round-half-round-bag-black-red-signature.jpg",
  "/images/products/handbags/half-round-half-round-bag-navy-red-centre-panel.jpg",
  "/images/products/handbags/half-round-half-round-bag-grey-orange-sport.jpg",
  "/images/products/handbags/half-round-half-round-bag-olive-brown-earth-tone.jpg",
  // Festive Travel Collection (Extracted from Diwali 2026 PDF)
  "/images/products/handbags/diwali-festive-style-01.jpg",
  "/images/products/handbags/diwali-festive-style-02.jpg",
  "/images/products/handbags/diwali-festive-style-03.jpg",
  "/images/products/handbags/diwali-festive-style-04.jpg",
  "/images/products/handbags/diwali-festive-style-05.jpg",
  "/images/products/handbags/diwali-festive-style-06.jpg",
  // Special Lunch Bags (Extracted from Lunch Bag PDF)
  "/images/products/handbags/lunch-bag-lb-01-midnight-quilted.jpg",
  "/images/products/handbags/lunch-bag-lb-02-mint-blossom.jpg",
  "/images/products/handbags/lunch-bag-lb-05-blue-gingham-classic.jpg",
  "/images/products/handbags/lunch-bag-lb-07-natural-jute-look.jpg",
  "/images/products/handbags/lunch-bag-lb-11-urban-black.jpg",
  "/images/products/handbags/lunch-bag-lb-24-executive-grey.jpg",
  // Digital Round Bags (Extracted from Round Bag PDF)
  "/images/products/handbags/custom-digital-round-bag-corporate-campaign.jpg",
  "/images/products/handbags/custom-digital-round-bag-signature-monogram.jpg",
  "/images/products/handbags/custom-digital-round-bag-skyline-edition.jpg",
  "/images/products/handbags/custom-digital-round-bag-minimal-horizon.jpg",
];

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  categories,
  onSuccess,
}: ProductFormModalProps) {
  const isEditing = Boolean(product);

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState<number | string>("");
  const [compareAtPrice, setCompareAtPrice] = React.useState<number | string>("");
  const [categoryId, setCategoryId] = React.useState("");
  const [stock, setStock] = React.useState<number | string>(10);
  const [sku, setSku] = React.useState("");
  const [materials, setMaterials] = React.useState("");
  const [dimensions, setDimensions] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [images, setImages] = React.useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setDescription(product.description || "");
      setPrice(product.price);
      setCompareAtPrice(product.compareAtPrice || "");
      setCategoryId(product.categoryId);
      setStock(product.stock);
      setSku(product.sku);
      setMaterials(product.materials || "");
      setDimensions(product.dimensions || "");
      setTags(product.tags ? product.tags.join(", ") : "");
      setIsFeatured(product.isFeatured);
      setImages(product.images || []);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setPrice("");
      setCompareAtPrice("");
      setCategoryId(categories[0]?.id || "");
      setStock(10);
      setSku(`HB-${Math.floor(100 + Math.random() * 900)}`);
      setMaterials("100% Full-grain Tuscan Calf Leather, Solid Brass Fittings");
      setDimensions("12.0\" W x 9.5\" H x 4.5\" D");
      setTags("Handcrafted, New");
      setIsFeatured(false);
      setImages([PRESET_HANDBAG_IMAGES[0]]);
    }
    setErrors({});
  }, [product, categories, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Product name is required";
    if (!price || Number(price) <= 0) newErrors.price = "Valid price is required";
    if (!categoryId) newErrors.categoryId = "Category selection is required";
    if (stock === "" || Number(stock) < 0) newErrors.stock = "Valid stock quantity is required";
    if (images.length === 0) newErrors.images = "At least one image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddImage = (url: string) => {
    if (url && !images.includes(url)) {
      setImages([...images, url]);
      setCustomImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name,
        slug: slug ? slugify(slug) : slugify(name),
        description,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        categoryId,
        stock: Number(stock),
        sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        materials,
        dimensions,
        tags: tagList,
        isFeatured,
        images: images.length > 0 ? images : [PRESET_HANDBAG_IMAGES[0]],
      };

      let res;
      if (isEditing && product) {
        res = await updateProductAction(product.id, payload);
      } else {
        res = await createProductAction(payload);
      }

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        alert(res.error || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Atelier Silhouette" : "Add New Silhouette"}
      description="Configure product specifications, pricing, imagery, and inventory levels."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Florentine Saddle Bag"
            error={errors.name}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-11 border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-rose-600">{errors.categoryId}</p>
            )}
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Retail Price ($) *"
            type="number"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="350"
            error={errors.price}
          />

          <Input
            label="Compare At Price ($)"
            type="number"
            step="1"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            placeholder="420"
          />

          <Input
            label="Stock Quantity *"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="15"
            error={errors.stock}
          />
        </div>

        {/* SKU and Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="SKU Identifier"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="HB-SDL-002"
          />

          <Input
            label="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Bestseller, Full-grain, New"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed narrative describing craftsmanship, leather finish, and functional compartments..."
            className="w-full border border-stone-300 bg-white p-3 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
          />
        </div>

        {/* Materials & Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Materials & Hardware"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="100% Full-grain Tuscan Calf Leather..."
          />

          <Input
            label="Dimensions & Fit"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            placeholder={'12.0" W x 9.5" H x 4.5" D'}
          />
        </div>

        {/* Image Management Section */}
        <div className="space-y-3 pt-2 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Product Images ({images.length})
            </label>
            <span className="text-[11px] text-stone-500">
              Select from atelier presets or enter custom URL
            </span>
          </div>

          {/* Active images preview list */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 p-3 bg-stone-50 border border-stone-200">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group w-20 h-24 border border-stone-300 bg-white overflow-hidden shadow-sm"
                >
                  <Image
                    src={img}
                    alt={`Product preview ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-stone-900/80 text-[9px] text-white text-center py-0.5 uppercase tracking-wider">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {errors.images && (
            <p className="text-xs text-rose-600">{errors.images}</p>
          )}

          {/* Preset image selector */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 block">
              Quick Pick Preset Handbag Assets:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {PRESET_HANDBAG_IMAGES.map((presetPath, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddImage(presetPath)}
                  className={`relative flex-shrink-0 w-14 h-16 border overflow-hidden hover:border-stone-900 transition-all ${
                    images.includes(presetPath)
                      ? "ring-2 ring-stone-900 opacity-40 cursor-not-allowed"
                      : "border-stone-200 hover:scale-105"
                  }`}
                  title={presetPath}
                >
                  <Image
                    src={presetPath}
                    alt="Preset"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Custom image URL input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Or enter custom image URL / path (e.g. /images/products/handbags/... or https://...)"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              className="flex-1 h-9 border border-stone-300 bg-white px-3 text-xs focus:outline-none focus:border-stone-900"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddImage(customImageUrl)}
              disabled={!customImageUrl.trim()}
            >
              Add URL
            </Button>
          </div>
        </div>

        {/* Featured checkbox */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-stone-900 rounded"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Highlight as Bestseller / Featured Silhouette
            </span>
          </label>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="uppercase tracking-wider text-xs px-6"
          >
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
