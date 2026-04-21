import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import CourseDetail from "./pages/CourseDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/Search";
import Wishlist from "./pages/Wishlist";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Account from "./pages/Account";
import MyLearning from "./pages/MyLearning";
import AdminDashboard from "./pages/AdminDashboard";
import Compare from "./pages/Compare";
import OrderTracking from "./pages/OrderTracking";
import InstructorDashboard from "./pages/InstructorDashboard";
import CourseCreator from "./pages/CourseCreator";
import BecomeInstructor from "./pages/BecomeInstructor";
import CourseLearnWrapper from "./pages/CourseLearnWrapper";

export const router = createBrowserRouter([
  // ── Full-screen learning page (no Header/Footer) ──
  {
    path: "/learn/:courseId",
    Component: CourseLearnWrapper,
  },
  // ── Main site ──
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "course/:id", Component: CourseDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "search", Component: SearchPage },
      { path: "wishlist", Component: Wishlist },
      { path: "blog", Component: Blog },
      { path: "blog/:id", Component: BlogDetail },
      { path: "account", Component: Account },
      { path: "my-learning", Component: MyLearning },
      { path: "admin", Component: AdminDashboard },
      { path: "instructor", Component: InstructorDashboard },
      { path: "instructor/create-course", Component: CourseCreator },
      { path: "become-instructor", Component: BecomeInstructor },
      { path: "compare", Component: Compare },
      { path: "order-tracking", Component: OrderTracking },
      { path: "*", Component: NotFound },
    ],
  },
]);