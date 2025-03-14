import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // Ensure correct base path for deployment
  build: {
    outDir: "dist",
  },
  server: {
    port: 8000, // Optional: Ensure correct port for local dev
  },
});
