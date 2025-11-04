import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,          // Para usar describe, it, expect globalmente
    environment: 'jsdom',   // Simula el navegador (necesario para React)
    setupFiles: './src/tests/setupTests.js' // Archivo para importaciones globales
  },
  
  //para que el fronted pueda comunicarse
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Cambia esto por la URL de tu backend
        changeOrigin: true, // para evitar problemas de CORS
        secure: false, //
      },
    },
  },
})
