"use client";

import * as React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category } from "@/lib/types";
import { createCategoryAction, updateCategoryAction } from "@/app/actions";
import { slugify } from "@/lib/utils";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess?: () => void;
}

const CATEGORY_IMAGE_PRESETS = [
  { label: "Hand Bags", url: "/images/products/handbags/classic-leather-tote.jpg" },
  { label: "Clutches", url: "/images/products/handbags/monogram-clutch-wallet.jpg" },
  { label: "Backpacks", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80" },
  { label: "Wallets", url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80" },
];

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryFormModalProps) {
  const isEditing = Boolean(category);

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || "");
      setImageUrl(category.imageUrl || "");
      setIsActive(category.isActive);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setImageUrl(CATEGORY_IMAGE_PRESETS[0].url);
      setIsActive(true);
    }
    setErrors({});
  }, [category, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(slugify(val));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Category name is required";
    if (!imageUrl.trim()) errs.imageUrl = "Category banner image is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        slug: slug ? slugify(slug) : slugify(name),
        description,
        imageUrl,
        isActive,
      };

      let res;
      if (isEditing && category) {
        res = await updateCategoryAction(category.id, payload);
      } else {
        res = await createCategoryAction(payload);
      }

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        alert(res.error || "Failed to save category");
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
      title={isEditing ? "Edit Atelier Category" : "Add New Category"}
      description="Organize your luxury collection with distinct category taxonomy."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Category Name *"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Travel Duffles"
          error={errors.name}
        />

        <Input
          label="Slug (URL identifier)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. travel-duffles"
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Narrative summary for this category banner..."
            className="w-full border border-stone-300 bg-white p-3 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
          />
        </div>

        {/* Category Image */}
        <div className="space-y-3">
          <Input
            label="Banner Image URL / File Path *"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="/images/products/handbags/... or https://..."
            error={errors.imageUrl}
          />

          {/* Quick presets */}
          <div className="flex gap-2 items-center">
            <span className="text-[11px] text-stone-500 uppercase tracking-wider">
              Presets:
            </span>
            {CATEGORY_IMAGE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setImageUrl(preset.url)}
                className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-1 rounded"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Preview */}
          {imageUrl && (
            <div className="relative aspect-video w-full max-w-xs overflow-hidden border border-stone-200 bg-stone-100">
              <Image
                src={imageUrl}
                alt="Banner preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Status Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-stone-900 rounded"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Active Category (Visible in Navigation & Filters)
            </span>
          </label>
        </div>

        {/* Action Buttons */}
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
            {isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
