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

export const router = createBrowserRouter([
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
      { path: "*", Component: NotFound },
    ],
  },
]);
