import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import cartographer from "@replit/vite-plugin-cartographer";

// emulate __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(mode !== "production" && process.env.REPL_ID ? [cartographer()] : [])
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
      // Removed @assets alias → attached_assets dir deleted in repo
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: mode !== "production", // ✅ source maps only in dev
    target: "esnext"
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"] // prevent serving hidden files
    },
    port: 5173,
    strictPort: true,
    open: true
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
    "process.env.REPL_ID": JSON.stringify(process.env.REPL_ID ?? "")
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"]
  }
}));
