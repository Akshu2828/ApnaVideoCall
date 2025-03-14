import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    host: true,
    port: 3000,
  },
  preview: {
    port: 5000,
  },
  base: "./",
});
