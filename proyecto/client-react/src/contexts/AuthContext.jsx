import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const location = useLocation();

  useEffect(() => {
    // Se ejecuta al montar y en cambios de ruta
    fetch("http://localhost:5000/usuarios/perfil", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        setIsLogged(res.ok);
        if (res.ok) {
          return fetch("http://localhost:5000/usuarios/es_dueno", { credentials: "include" });
        }
      })
      .then((res) => res ? res.json() : null)
      .then((data) => {
        setIsOwner(data?.es_dueno || false);
        return fetch("http://localhost:5000/usuarios/perfil", { credentials: "include" });
      })
      .then((res) => res ? res.json() : null)
      .then((data) => {
        if (data?.id_cliente) setUserRole('cliente');
        else if (data?.id_empleado) setUserRole('empleado');
        else setUserRole('dueño');

        console.log("UserRole cargado:", userRole);  // Log para depurar

        // Redirección automática para empleados (descomentada)
        if (data?.id_empleado && location.pathname !== '/dashboard-empleado') {
          window.location.href = '/dashboard-empleado';
        }
      })
      .catch(() => {
        setIsLogged(false);
        setIsOwner(false);
        setUserRole(null);
      });
  }, [location.pathname]);  // Ejecuta en cambios de ruta

  const login = () => setIsLogged(true);
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

export function useAuthContext() {
  return useContext(AuthContext);
}