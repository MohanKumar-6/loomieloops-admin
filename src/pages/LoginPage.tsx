import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, Mail } from "lucide-react";
import api, { API_BASE_URL } from "../lib/api";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, token, isReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isReady && token) navigate({ to: "/" });
  }, [isReady, token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(api.auth.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          data.message ||
            `Login failed (${response.status}). API: ${api.auth.login}`,
        );
        return;
      }
      if (data.user.role !== "admin") {
        setError("Admin access required");
        return;
      }
      login(data.token, data.user);
      navigate({ to: "/" });
    } catch {
      setError(`Cannot reach the API at ${API_BASE_URL}. Check your connection or VITE_API_URL.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-cyan overflow-x-hidden">
      <div className="nb-card max-w-md w-full min-w-0 p-5 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <span className="nb-tag bg-pink mb-4">ADMIN PANEL</span>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">SIGN IN</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 border-[3px] border-ink font-bold bg-pink/20 break-words">{error}</div>
        )}

        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="min-w-0">
            <label className="block text-sm font-extrabold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              className="nb-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-extrabold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              className="nb-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="nb-btn nb-btn-primary w-full justify-center gap-2"
          >
            {loading ? "Signing In..." : "Sign In"} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
