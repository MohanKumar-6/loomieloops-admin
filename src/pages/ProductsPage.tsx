import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { adminFetch, api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { PageHeader } from "../components/PageHeader";
import { TableScroll } from "../components/TableScroll";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string | null;
  category: string;
  stock: number;
};

const emptyForm = { id: "", name: "", price: "", category: "", stock: "0", image: "" };

export function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    adminFetch(api.admin.products, token)
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      stock: String(p.stock),
      image: p.image ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const body = {
        id: form.id,
        name: form.name,
        price: form.price,
        category: form.category,
        stock: Number(form.stock),
        image: form.image || null,
      };
      if (editing) {
        await adminFetch(api.admin.product(editing.id), token, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await adminFetch(api.admin.products, token, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this product?")) return;
    try {
      await adminFetch(api.admin.product(id), token, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="min-w-0">
      <PageHeader
        tag="CATALOG"
        tagClass="bg-lime"
        title="PRODUCTS"
        action={
          <button onClick={openCreate} className="nb-btn nb-btn-primary nb-btn-sm gap-2 w-full sm:w-auto justify-center">
            <Plus size={14} /> Add Product
          </button>
        }
      />

      {error && (
        <div className="mb-6 p-4 border-[3px] border-ink font-bold bg-pink/20 break-words">{error}</div>
      )}

      {showForm && (
        <div className="nb-card p-4 sm:p-6 mb-6 sm:mb-8 min-w-0">
          <div className="flex justify-between items-start gap-3 mb-6 min-w-0">
            <h3 className="font-display text-2xl sm:text-3xl break-words">
              {editing ? "EDIT" : "NEW"} PRODUCT
            </h3>
            <button onClick={() => setShowForm(false)} className="nb-btn nb-btn-sm shrink-0">
              <X size={14} />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4 min-w-0">
            <div className="min-w-0">
              <label className="block text-xs font-extrabold uppercase mb-2">Slug ID</label>
              <input
                className="nb-input"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                disabled={!!editing}
                required
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-extrabold uppercase mb-2">Name</label>
              <input
                className="nb-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-extrabold uppercase mb-2">Price</label>
              <input
                className="nb-input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-extrabold uppercase mb-2">Category</label>
              <input
                className="nb-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-extrabold uppercase mb-2">Stock</label>
              <input
                type="number"
                className="nb-input"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div className="min-w-0 sm:col-span-2">
              <label className="block text-xs font-extrabold uppercase mb-2">Image URL</label>
              <input
                className="nb-input"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="nb-btn nb-btn-lime w-full justify-center">
                {saving ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <TableScroll minWidth="560px">
        <thead className="bg-yellow border-b-[3px] border-ink">
          <tr>
            {["Product", "Category", "Price", "Stock", "Actions"].map((h) => (
              <th key={h} className="px-3 sm:px-4 py-3 font-extrabold uppercase text-xs tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-[3px] divide-ink">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center font-mono text-sm uppercase">
                Loading...
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center font-mono text-sm uppercase opacity-60">
                No products yet
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td className="px-3 sm:px-4 py-3 font-bold max-w-[10rem] sm:max-w-none break-words">{p.name}</td>
                <td className="px-3 sm:px-4 py-3 font-mono text-xs uppercase whitespace-nowrap">{p.category}</td>
                <td className="px-3 sm:px-4 py-3 font-mono whitespace-nowrap">₹{Number(p.price).toLocaleString("en-IN")}</td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{p.stock}</td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                    <button onClick={() => openEdit(p)} className="font-extrabold text-sm uppercase hover:text-pink text-left">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="font-extrabold text-sm uppercase hover:text-orange text-left">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </TableScroll>
    </div>
  );
}
