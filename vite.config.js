import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Default build directory for Vite
    rollupOptions: {
      input: "index.html",
    },
  },
});
