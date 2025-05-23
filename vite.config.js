import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "index.html", // Ensure the path is correct to the index.html file
       external: ['papaparse'],
    },
  },
});
