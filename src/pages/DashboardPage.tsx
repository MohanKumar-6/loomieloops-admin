import { useEffect, useState } from "react";
import { adminFetch, api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { PageHeader } from "../components/PageHeader";

type Stats = {
  totalSales: number;
  activeOrders: number;
  newCustomers: number;
  totalProducts: number;
};

export function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    adminFetch(api.admin.stats, token)
      .then(setStats)
      .catch((e) => setError(e.message));
  }, [token]);

  const cards = stats
    ? [
        { label: "Total Sales", value: `₹${stats.totalSales.toLocaleString("en-IN")}`, bg: "bg-lime" },
        { label: "Active Orders", value: stats.activeOrders, bg: "bg-cyan" },
        { label: "New Customers", value: stats.newCustomers, bg: "bg-yellow" },
        { label: "Products", value: stats.totalProducts, bg: "bg-pink" },
      ]
    : [];

  return (
    <div className="min-w-0">
      <PageHeader tag="OVERVIEW" tagClass="bg-cyan" title="DASHBOARD" />

      {error && (
        <div className="mb-6 p-4 border-[3px] border-ink font-bold bg-pink/20 break-words">{error}</div>
      )}

      {!stats && !error && (
        <p className="font-mono text-sm uppercase tracking-wider">Loading stats...</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((c) => (
          <div key={c.label} className={`nb-card p-4 sm:p-6 min-w-0 ${c.bg}`}>
            <p className="text-xs font-extrabold uppercase tracking-widest opacity-70">{c.label}</p>
            <p className="font-display text-3xl sm:text-4xl xl:text-5xl mt-2 break-words">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
