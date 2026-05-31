import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { adminFetch, api } from "../lib/api";
import { slugify } from "../lib/imageUtils";
import { ProductImageUploader } from "./ProductImageUploader";

export type ProductFormData = {
  id: string;
  name: string;
  price: string;
  category: string;
  stock: string;
  images: string[];
  description: string;
  dimensions: string;
  material: string;
  care: string;
  color: string;
};

type ProductFormProps = {
  token: string;
  editingId?: string;
  initial: ProductFormData;
  onSaved: () => void;
  onCancel: () => void;
};

export function ProductForm({ token, editingId, initial, onSaved, onCancel }: ProductFormProps) {
  const [form, setForm] = useState(initial);
  const [images, setImages] = useState<string[]>(initial.images);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [autoSlug, setAutoSlug] = useState(!editingId);

  useEffect(() => {
    if (autoSlug && form.name) {
      setForm((f) => ({ ...f, id: slugify(form.name) }));
    }
  }, [form.name, autoSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!images.length) {
      setError("Add at least one product image.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = {
        id: form.id,
        name: form.name,
        price: form.price,
        category: form.category,
        stock: Number(form.stock),
        images,
        description: form.description,
        dimensions: form.dimensions,
        material: form.material,
        care: form.care,
        color: form.color,
      };
      if (editingId) {
        await adminFetch(api.admin.product(editingId), token, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await adminFetch(api.admin.products, token, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof ProductFormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="nb-card p-4 sm:p-6 mb-6 sm:mb-8 min-w-0">
      <div className="flex justify-between items-start gap-3 mb-5 min-w-0">
        <h3 className="font-display text-2xl sm:text-3xl break-words">
          {editingId ? "EDIT" : "NEW"} PRODUCT
        </h3>
        <button type="button" onClick={onCancel} className="nb-btn nb-btn-sm shrink-0">
          <X size={14} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 border-[3px] border-ink font-bold text-sm bg-pink/20 break-words">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 min-w-0">
        <ProductImageUploader token={token} images={images} onChange={setImages} disabled={saving} />

        <div className="border-t-[3px] border-ink pt-5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-4">Product Details</p>
          <div className="grid sm:grid-cols-2 gap-4 min-w-0">
            <div className="min-w-0 sm:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase mb-1.5">Name</label>
              <input
                className="nb-input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Hot Pink Disco Tote"
                required
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[10px] font-extrabold uppercase mb-1.5">Slug ID</label>
              <input
                className="nb-input font-mono text-sm"
                value={form.id}
                onChange={(e) => {
                  setAutoSlug(false);
                  set("id", e.target.value);
                }}
                disabled={!!editingId}
                required
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[10px] font-extrabold uppercase mb-1.5">Category</label>
              <input
                className="nb-input"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="bags"
                required
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[10px] font-extrabold uppercase mb-1.5">Price (₹)</label>
              <input
                className="nb-input"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="2499"
                required
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[10px] font-extrabold uppercase mb-1.5">Stock</label>
              <input
                type="number"
                min={0}
                className="nb-input"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[10px] font-extrabold uppercase mb-1.5">Color</label>
              <input
                className="nb-input"
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                placeholder="Hot pink"
              />
            </div>
            <div className="min-w-0 sm:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase mb-1.5">Description</label>
              <textarea
                className="nb-input min-h-[100px] resize-y"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Hand-crocheted tote with sturdy handles..."
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[10px] font-extrabold uppercase mb-1.5">Dimensions</label>
              <input
                className="nb-input"
                value={form.dimensions}
                onChange={(e) => set("dimensions", e.target.value)}
                placeholder="35 × 40 cm"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[10px] font-extrabold uppercase mb-1.5">Material</label>
              <input
                className="nb-input"
                value={form.material}
                onChange={(e) => set("material", e.target.value)}
                placeholder="Cotton blend yarn"
              />
            </div>
            <div className="min-w-0 sm:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase mb-1.5">Care</label>
              <input
                className="nb-input"
                value={form.care}
                onChange={(e) => set("care", e.target.value)}
                placeholder="Hand wash, lay flat to dry"
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="nb-btn nb-btn-lime w-full justify-center">
          {saving ? "Saving..." : editingId ? "Update Product" : "Publish Product"}
        </button>
      </form>
    </div>
  );
}
