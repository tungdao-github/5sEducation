import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/admin/",
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used â€“ do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the app directory
      "@": path.resolve(__dirname, "./app"),
    },
  },
  build: {
    outDir: "apps/web/public/admin",
    emptyOutDir: true,
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
});