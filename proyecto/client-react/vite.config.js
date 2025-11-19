import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    globals: true, // Para usar describe, it, expect globalmente
    environment: "jsdom", // Simula el navegador (necesario para React)
    setupFiles: ["./src/test/setupTests.jsx"], // Archivo para importaciones globales
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./src/test"),
    },
  },
  //para que el fronted pueda comunicarse
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Cambia esto por la URL de tu backend
        changeOrigin: true, // para evitar problemas de CORS
        secure: false, //
      },
    },
  },
});
