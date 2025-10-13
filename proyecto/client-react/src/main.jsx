import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from "./context/AuthContext";
import App from './App'
import { CarritoProvider } from './context/CarritoContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  //Cuando lo rodeo con CarritoProvider estoy dicinedo que todo dentro de <App /> puede acceder al carrito
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider> {/* Nuevo: Wrappea todo para que el carrito sea accesible en toda la app */}
          <App />
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
