import { useEffect, useState } from "react";
import { adminFetch, api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { PageHeader } from "../components/PageHeader";

export function SettingsPage() {
  const { token } = useAuth();
  const [tag, setTag] = useState("HANDMADE CROCHET MAGIC");
  const [headline, setHeadline] = useState("HOOKED ON LOOPS.");
  const [subheadline, setSubheadline] = useState(
    "One-of-a-kind crochet pieces, hand-hooked in small batches.",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    adminFetch(api.admin.settings, token)
      .then((data: Record<string, string>) => {
        if (data.hero_tag) setTag(data.hero_tag);
        if (data.hero_headline) setHeadline(data.hero_headline);
        if (data.hero_subheadline) setSubheadline(data.hero_subheadline);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await adminFetch(api.admin.settings, token, {
        method: "PUT",
        body: JSON.stringify({
          hero_tag: tag,
          hero_headline: headline,
          hero_subheadline: subheadline,
        }),
      });
      setMessage("Hero settings saved!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="font-mono text-sm uppercase">Loading settings...</p>;
  }

  return (
    <div className="min-w-0">
      <PageHeader tag="STOREFRONT" tagClass="bg-lime" title="HERO SETTINGS" />

      {error && (
        <div className="mb-6 p-4 border-[3px] border-ink font-bold bg-pink/20 break-words">{error}</div>
      )}
      {message && (
        <div className="mb-6 p-4 border-[3px] border-ink font-bold bg-lime break-words">{message}</div>
      )}

      <div className="nb-card p-4 sm:p-6 w-full min-w-0">
        <form onSubmit={handleSave} className="space-y-4 min-w-0">
          <div className="min-w-0">
            <label className="block text-xs font-extrabold uppercase mb-2">Hero Tag</label>
            <input className="nb-input" value={tag} onChange={(e) => setTag(e.target.value)} />
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-extrabold uppercase mb-2">Headline</label>
            <input className="nb-input" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-extrabold uppercase mb-2">Subheadline</label>
            <textarea
              className="nb-input h-24 resize-none"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
            />
          </div>
          <button type="submit" disabled={saving} className="nb-btn nb-btn-primary w-full justify-center">
            {saving ? "Saving..." : "Save Hero Content"}
          </button>
        </form>
      </div>
    </div>
  );
}
