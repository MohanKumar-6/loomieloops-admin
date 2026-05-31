import { useEffect, useState } from "react";
import { adminFetch, api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { PageHeader } from "../components/PageHeader";

type Announcement = {
  id: string;
  content: string;
  isActive: number;
  createdAt: string;
};

export function AnnouncementsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => {
    if (!token) return;
    adminFetch(api.admin.announcements, token)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !content.trim()) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await adminFetch(api.admin.announcements, token, {
        method: "POST",
        body: JSON.stringify({ content, isActive: true }),
      });
      setContent("");
      setMessage("Announcement published!");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: Announcement) => {
    if (!token) return;
    try {
      await adminFetch(api.admin.announcement(item.id), token, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete announcement?")) return;
    try {
      await adminFetch(api.admin.announcement(id), token, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="min-w-0">
      <PageHeader tag="BANNERS" tagClass="bg-pink" title="ANNOUNCEMENTS" />

      {error && (
        <div className="mb-6 p-4 border-[3px] border-ink font-bold bg-pink/20 break-words">{error}</div>
      )}
      {message && (
        <div className="mb-6 p-4 border-[3px] border-ink font-bold bg-lime break-words">{message}</div>
      )}

      <div className="nb-card p-4 sm:p-6 mb-6 sm:mb-8 w-full min-w-0">
        <form onSubmit={handlePublish}>
          <label className="block text-xs font-extrabold uppercase mb-2">New Announcement</label>
          <textarea
            className="nb-input h-32 resize-none"
            placeholder="Type your banner message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" disabled={saving} className="nb-btn nb-btn-pink w-full justify-center mt-4">
            {saving ? "Publishing..." : "Publish Announcement"}
          </button>
        </form>
      </div>

      <div className="space-y-4 min-w-0">
        {loading ? (
          <p className="font-mono text-sm uppercase">Loading...</p>
        ) : items.length === 0 ? (
          <p className="font-mono text-sm uppercase opacity-60">No announcements yet</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`nb-card p-4 min-w-0 ${item.isActive ? "bg-lime" : ""}`}>
              <p className="font-bold mb-3 break-words">{item.content}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => toggleActive(item)} className="nb-btn nb-btn-sm nb-btn-yellow">
                  {item.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleDelete(item.id)} className="nb-btn nb-btn-sm bg-orange/30 hover:bg-orange/50">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
