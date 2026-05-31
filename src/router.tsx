import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { AdminLayout } from "./components/AdminLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { OrdersPage } from "./pages/OrdersPage";
import { UsersPage } from "./pages/UsersPage";
import { AnnouncementsPage } from "./pages/AnnouncementsPage";
import { SettingsPage } from "./pages/SettingsPage";

function getAuth() {
  try {
    const token = localStorage.getItem("admin_token");
    const raw = localStorage.getItem("admin_user");
    if (!token || !raw) return null;
    const user = JSON.parse(raw);
    if (user.role !== "admin") return null;
    return { token, user };
  } catch {
    return null;
  }
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: () => {
    if (getAuth()) throw redirect({ to: "/" });
  },
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin",
  component: AdminLayout,
  beforeLoad: () => {
    if (!getAuth()) throw redirect({ to: "/login" });
  },
});

const indexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: DashboardPage,
});

const productsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/products",
  component: ProductsPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/orders",
  component: OrdersPage,
});

const usersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/users",
  component: UsersPage,
});

const announcementsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/announcements",
  component: AnnouncementsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  adminLayoutRoute.addChildren([
    indexRoute,
    productsRoute,
    ordersRoute,
    usersRoute,
    announcementsRoute,
    settingsRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
