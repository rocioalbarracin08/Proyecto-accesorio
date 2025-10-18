import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(false);  // Estado: ¿Usuario logueado?
  const [isOwner, setIsOwner] = useState(false);    // NUEVO: Estado: ¿Es el dueño único?

  const location = useLocation();  // Hook para detectar cambios de ruta

  useEffect(() => {
    // Se ejecuta cada vez que cambia la ruta (e.g., al navegar)
    // Paso 1: Verificar si está logueado llamando a /perfil
    fetch("http://localhost:5000/usuarios/perfil", {
      method: "GET",
      credentials: "include",  // Envía cookies (token) para autenticación
    })
      .then((res) => {
        setIsLogged(res.ok);  // Si la respuesta es OK (200), está logueado
        if (res.ok) {
          // Paso 2: Si está logueado, verificar si es dueño llamando a /es_dueno
          return fetch("http://localhost:5000/usuarios/es_dueno", {
            method: "GET",
            credentials: "include",
          });
        }
      })
      .then((res) => res ? res.json() : null)  // Convierte respuesta a JSON si existe
      .then((data) => {
        setIsOwner(data?.es_dueno || false);  // Actualiza isOwner basado en la respuesta (true si es dueño)
      })
      .catch(() => {
        // Si hay error (e.g., token expirado), resetea estados
        setIsLogged(false);
        setIsOwner(false);
      });
  }, [location]);  // Dependencia: se ejecuta al cambiar ruta

  // Función para marcar logueado (llamada desde Login.jsx)
  const login = () => setIsLogged(true);

  // Función para marcar no logueado y resetear dueño (llamada desde BarraNavegacion.jsx)
  const logout = () => {
    setIsLogged(false);
    setIsOwner(false);
  };

  // Proporciona los valores a todos los componentes hijos
  return (
    <AuthContext.Provider value={{ isLogged, isOwner, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto en cualquier componente
export function useAuthContext() {
  return useContext(AuthContext);
}