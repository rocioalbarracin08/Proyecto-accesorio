import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter } from 'react-router-dom';
import App from './App'
import { CarritoProvider } from './contexts/CarritoContext';
import { PromocionesProvider } from './contexts/PromocionesContext';
import { CategoriasProvider } from './contexts/CategoriasContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  //Cuando lo rodeo con CarritoProvider estoy dicinedo que todo dentro de <App /> puede acceder al carrito
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PromocionesProvider>
          <CategoriasProvider>
            <CarritoProvider> {/* Nuevo: Wrappea todo para que el carrito sea accesible en toda la app */}
              <App />
            </CarritoProvider>
          </CategoriasProvider>
        </PromocionesProvider>
      </AuthProvider>
      </BrowserRouter>
  </React.StrictMode>,
)
