import { useEffect, useState } from "react";
import { adminFetch, api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { PageHeader } from "../components/PageHeader";
import { TableScroll } from "../components/TableScroll";

type Order = {
  id: string;
  userId: string | null;
  total: string;
  status: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
};

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    if (!token) return;
    adminFetch(api.admin.orders, token)
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const updateStatus = async (id: string, status: string) => {
    if (!token) return;
    try {
      await adminFetch(api.admin.order(id), token, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="min-w-0">
      <PageHeader tag="FULFILLMENT" tagClass="bg-cyan" title="ORDERS" />

      {error && (
        <div className="mb-6 p-4 border-[3px] border-ink font-bold bg-pink/20 break-words">{error}</div>
      )}

      <TableScroll minWidth="720px">
        <thead className="bg-cyan border-b-[3px] border-ink">
          <tr>
            {["Order ID", "Customer", "Total", "Status", "Date", "Update"].map((h) => (
              <th key={h} className="px-3 sm:px-4 py-3 font-extrabold uppercase text-xs tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-[3px] divide-ink">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center font-mono text-sm uppercase">
                Loading...
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center font-mono text-sm uppercase opacity-60">
                No orders yet
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id}>
                <td className="px-3 sm:px-4 py-3 font-mono text-xs whitespace-nowrap">{o.id.slice(0, 8)}...</td>
                <td className="px-3 sm:px-4 py-3 min-w-[8rem]">
                  <div className="font-bold break-words">{o.userName ?? "Guest"}</div>
                  <div className="font-mono text-xs opacity-60 break-all">{o.userEmail ?? "—"}</div>
                </td>
                <td className="px-3 sm:px-4 py-3 font-mono whitespace-nowrap">₹{Number(o.total).toLocaleString("en-IN")}</td>
                <td className="px-3 sm:px-4 py-3">
                  <span className="nb-tag bg-yellow text-[10px] py-1 whitespace-nowrap">{o.status}</span>
                </td>
                <td className="px-3 sm:px-4 py-3 font-mono text-xs whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td className="px-3 sm:px-4 py-3 min-w-[8rem]">
                  <select
                    className="nb-input py-1 text-xs w-full min-w-[7rem]"
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </TableScroll>
    </div>
  );
}
