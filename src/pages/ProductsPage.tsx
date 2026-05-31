import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { adminFetch, api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { PageHeader } from "../components/PageHeader";
import { TableScroll } from "../components/TableScroll";
import { ProductForm, type ProductFormData } from "../components/ProductForm";
import { squareImageUrl } from "../lib/productImage";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string | null;
  images?: string[];
  category: string;
  stock: number;
  description?: string | null;
  dimensions?: string | null;
  material?: string | null;
  care?: string | null;
  color?: string | null;
};

const emptyForm: ProductFormData = {
  id: "",
  name: "",
  price: "",
  category: "",
  stock: "0",
  images: [],
  description: "",
  dimensions: "",
  material: "",
  care: "",
  color: "",
};

export function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

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
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setShowForm(true);
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

  const formInitial: ProductFormData = editing
    ? {
        id: editing.id,
        name: editing.name,
        price: editing.price,
        category: editing.category,
        stock: String(editing.stock),
        images: editing.images?.length ? editing.images : editing.image ? [editing.image] : [],
        description: editing.description ?? "",
        dimensions: editing.dimensions ?? "",
        material: editing.material ?? "",
        care: editing.care ?? "",
        color: editing.color ?? "",
      }
    : emptyForm;

  return (
    <div className="min-w-0">
      <PageHeader
        tag="CATALOG"
        tagClass="bg-lime"
        title="PRODUCTS"
        action={
          !showForm ? (
            <button onClick={openCreate} className="nb-btn nb-btn-primary nb-btn-sm gap-2 w-full sm:w-auto justify-center">
              <Plus size={14} /> Add Product
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-6 p-3 border-[3px] border-ink font-bold text-sm bg-pink/20 break-words">{error}</div>
      )}

      {showForm && token && (
        <ProductForm
          key={editing?.id ?? "new"}
          token={token}
          editingId={editing?.id}
          initial={formInitial}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            load();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {!showForm && (
        <TableScroll minWidth="560px">
          <thead className="bg-yellow border-b-[3px] border-ink">
            <tr>
              {["", "Product", "Category", "Price", "Stock", "Actions"].map((h) => (
                <th key={h || "img"} className="px-3 sm:px-4 py-2.5 font-extrabold uppercase text-[10px] tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-[3px] divide-ink">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-mono text-xs uppercase">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-mono text-xs uppercase opacity-60">
                  No products yet
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const thumb = p.images?.[0] ?? p.image;
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-2">
                      {thumb ? (
                        <img
                          src={squareImageUrl(thumb, 128)}
                          alt=""
                          className="w-10 h-10 object-cover object-center aspect-square border-2 border-ink"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-yellow/50 border-2 border-ink" />
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 font-bold text-sm max-w-[10rem] sm:max-w-none break-words">{p.name}</td>
                    <td className="px-3 sm:px-4 py-2.5 font-mono text-[10px] uppercase whitespace-nowrap">{p.category}</td>
                    <td className="px-3 sm:px-4 py-2.5 font-mono text-sm whitespace-nowrap">₹{Number(p.price).toLocaleString("en-IN")}</td>
                    <td className="px-3 sm:px-4 py-2.5 text-sm whitespace-nowrap">{p.stock}</td>
                    <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button onClick={() => openEdit(p)} className="font-extrabold text-xs uppercase hover:text-pink text-left">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="font-extrabold text-xs uppercase hover:text-orange text-left">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </TableScroll>
      )}
    </div>
  );
}
