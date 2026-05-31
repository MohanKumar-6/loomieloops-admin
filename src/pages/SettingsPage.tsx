import { useEffect, useState } from "react";
import { adminFetch, api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { PageHeader } from "../components/PageHeader";
import { FooterDpField } from "../components/FooterDpField";
import { HeroImageField } from "../components/HeroImageField";

const DEFAULT_QUIPS = [
  "Hooked, not hurried",
  "Beige was never invited",
  "Stitch count: vibes only",
  "Caffeine-powered loops",
];

export function SettingsPage() {
  const { token } = useAuth();
  const [tag, setTag] = useState("HANDMADE CROCHET MAGIC");
  const [headline, setHeadline] = useState("HOOKED ON LOOPS.");
  const [subheadline, setSubheadline] = useState(
    "One-of-a-kind crochet pieces, hand-hooked in small batches.",
  );
  const [heroImage, setHeroImage] = useState("");
  const [quips, setQuips] = useState<string[]>(DEFAULT_QUIPS);
  const [footerDp, setFooterDp] = useState("");
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
        if (data.hero_image) setHeroImage(data.hero_image);
        if (data.footer_dp) setFooterDp(data.footer_dp);
        if (data.hero_quips) {
          try {
            const parsed = JSON.parse(data.hero_quips);
            if (Array.isArray(parsed) && parsed.length === 4) {
              setQuips(parsed.map(String));
            }
          } catch {
            /* keep defaults */
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const setQuip = (index: number, value: string) => {
    setQuips((prev) => prev.map((q, i) => (i === index ? value : q)));
  };

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
          hero_image: heroImage,
          hero_quips: JSON.stringify(quips),
          footer_dp: footerDp,
        }),
      });
      setMessage("Settings saved!");
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
      <PageHeader tag="STOREFRONT" tagClass="bg-lime" title="SITE SETTINGS" />

      {error && (
        <div className="mb-6 p-4 border-[3px] border-ink font-bold bg-pink/20 break-words">{error}</div>
      )}
      {message && (
        <div className="mb-6 p-4 border-[3px] border-ink font-bold bg-lime break-words">{message}</div>
      )}

      <form onSubmit={handleSave} className="space-y-8 min-w-0">
        <div className="nb-card p-4 sm:p-6 w-full min-w-0">
          <h2 className="font-display text-2xl mb-4">Footer Brand</h2>
          {token && (
            <FooterDpField
              token={token}
              value={footerDp}
              onChange={setFooterDp}
              disabled={saving}
            />
          )}
        </div>

        <div className="nb-card p-4 sm:p-6 w-full min-w-0 space-y-6">
          <h2 className="font-display text-2xl">Homepage Hero</h2>

          {token && (
            <HeroImageField
              token={token}
              value={heroImage}
              onChange={setHeroImage}
              disabled={saving}
            />
          )}

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

          <div className="min-w-0 space-y-3">
            <label className="block text-xs font-extrabold uppercase">Hero Quips</label>
            <p className="font-mono text-[10px] uppercase opacity-60">
              Four short witty lines under the hero image (replaces the old stats).
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {quips.map((quip, i) => (
                <div key={i} className="min-w-0">
                  <label className="block font-mono text-[10px] uppercase mb-1 opacity-60">
                    Quip {i + 1}
                  </label>
                  <input
                    className="nb-input text-sm"
                    value={quip}
                    onChange={(e) => setQuip(i, e.target.value)}
                    placeholder={DEFAULT_QUIPS[i]}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="nb-btn nb-btn-primary w-full justify-center">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
