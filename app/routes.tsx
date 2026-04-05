import { createBrowserRouter } from "react-router";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import CategoryManagement from "./pages/admin/CategoryManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import UserManagement from "./pages/admin/UserManagement";
import PageBuilder from "./pages/admin/PageBuilder";
import SystemSettings from "./pages/admin/SystemSettings";
import CouponManagement from "./pages/admin/CouponManagement";
import SEOSettings from "./pages/admin/SEOSettings";
import ActivityLog from "./pages/admin/ActivityLog";
import CourseForm from "./pages/admin/CourseForm";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "categories", Component: CategoryManagement },
      { path: "courses", Component: CourseManagement },
      { path: "courses/new", Component: CourseForm },
      { path: "courses/edit/:id", Component: CourseForm },
      { path: "orders", Component: OrderManagement },
      { path: "users", Component: UserManagement },
      { path: "page-builder", Component: PageBuilder },
      { path: "settings", Component: SystemSettings },
      { path: "coupons", Component: CouponManagement },
      { path: "seo", Component: SEOSettings },
      { path: "activity-log", Component: ActivityLog },
    ],
  },
]);
