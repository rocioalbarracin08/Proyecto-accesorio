import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(false);  // Estado: ¿Usuario logueado?
  const [isOwner, setIsOwner] = useState(false);    // Estado: ¿Es dueño?
  const [userRole, setUserRole] = useState(null);   // Estado: Rol ('cliente', 'empleado', 'dueño')

  //utilizar el authcontext para utilizar los datos del cliente en cualquier pagina, para no crear el get devuelta
  
  const location = useLocation();  // Detecta cambios de página

  useEffect(() => {
    // Se ejecuta al cambiar de página para mantener estados actualizados
    fetch("http://localhost:5000/usuarios/perfil", {
      method: "GET",
      credentials: "include",  // Envía cookies con token
    })
      .then((res) => {
        setIsLogged(res.ok);  // Actualiza si está logueado
        if (res.ok) {
          // Si logueado, verifica si es dueño
          return fetch("http://localhost:5000/usuarios/es_dueno", { credentials: "include" });
        }
      })
      .then((res) => res ? res.json() : null)
      .then((data) => {
        setIsOwner(data?.es_dueno || false);
        // Obtiene rol del perfil
        return fetch("http://localhost:5000/usuarios/perfil", { credentials: "include" });
      })
      .then((res) => res ? res.json() : null)
      .then((data) => {
        // Deduce rol basado en IDs
        if (data?.id_cliente) setUserRole('cliente');
        else if (data?.id_empleado) setUserRole('empleado');
        else setUserRole('dueño');
      })
      .catch(() => {
        // Resetea si hay error (e.g., token expirado)
        setIsLogged(false);
        setIsOwner(false);
        setUserRole(null);
      });
  }, [location]);  // Dependencia: se ejecuta al cambiar location

  // Función para marcar logueado
  const login = () => setIsLogged(true);  

  // Función para marcar no logueado y resetear
  const logout = () => {  
    fetch("http://localhost:5000/usuarios/logout", {
    method: "POST",
    credentials: "include",
    })
    .finally(() => {
      setIsLogged(false);
      setIsOwner(false);
      setUserRole(null);
    });                 
  };

  return (
    <AuthContext.Provider value={{ isLogged, isOwner, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para acceder a los valores del contexto
export function useAuthContext() {
  return useContext(AuthContext);
}
