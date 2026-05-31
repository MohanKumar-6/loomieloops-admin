import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../lib/auth";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/users", label: "Users", icon: Users },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/settings", label: "Site Settings", icon: Settings },
] as const;

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const navLinks = (
    <>
      {nav.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 font-extrabold text-[11px] uppercase tracking-[1px] border-[3px] border-transparent hover:bg-yellow hover:border-ink transition-colors [&.active]:bg-yellow [&.active]:border-ink [&.active]:nb-shadow"
        >
          <Icon size={18} className="shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper text-ink overflow-x-hidden">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 bg-pink border-b-[3px] border-ink px-4 py-3 min-w-0">
          <h1 className="font-display text-xl tracking-wider truncate">LOOMIE ADMIN</h1>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="nb-btn nb-btn-sm shrink-0 bg-yellow p-2"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-[min(100vw-3rem,16rem)] md:w-64
          bg-pink border-r-[3px] border-ink flex flex-col shrink-0
          transition-transform duration-200 ease-out
          md:translate-x-0 max-h-screen md:max-h-none
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
          top-0 md:top-auto
        `}
      >
        <div className="p-4 sm:p-6 border-b-[3px] border-ink min-w-0">
          <div className="hidden md:block">
            <h1 className="font-display text-2xl tracking-wider">LOOMIE ADMIN</h1>
          </div>
          {user && (
            <p className="font-mono text-xs uppercase tracking-wider mt-0 md:mt-2 opacity-70 truncate">
              {user.email}
            </p>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">{navLinks}</nav>

        <div className="p-3 border-t-[3px] border-ink shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="nb-btn nb-btn-sm w-full justify-center gap-2 bg-cyan hover:bg-lime"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 md:p-10 overflow-x-hidden overflow-y-auto">
        <div className="page-shell max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
