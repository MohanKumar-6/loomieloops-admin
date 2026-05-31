import { useEffect, useState } from "react";
import { adminFetch, api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { PageHeader } from "../components/PageHeader";
import { TableScroll } from "../components/TableScroll";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    adminFetch(api.admin.users, token)
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-w-0">
      <PageHeader tag="COMMUNITY" tagClass="bg-yellow" title="USERS" />

      {error && (
        <div className="mb-6 p-4 border-[3px] border-ink font-bold bg-pink/20 break-words">{error}</div>
      )}

      <TableScroll minWidth="520px">
        <thead className="bg-yellow border-b-[3px] border-ink">
          <tr>
            {["Name", "Email", "Role", "Joined"].map((h) => (
              <th key={h} className="px-3 sm:px-4 py-3 font-extrabold uppercase text-xs tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-[3px] divide-ink">
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center font-mono text-sm uppercase">
                Loading...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center font-mono text-sm uppercase opacity-60">
                No users yet
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td className="px-3 sm:px-4 py-3 font-bold break-words">{u.name ?? "—"}</td>
                <td className="px-3 sm:px-4 py-3 font-mono text-sm break-all">{u.email}</td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                  <span className={`nb-tag text-[10px] py-1 ${u.role === "admin" ? "bg-pink" : "bg-lime"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 font-mono text-xs whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </TableScroll>
    </div>
  );
}
