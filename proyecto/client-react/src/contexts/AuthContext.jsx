import { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loginTrigger, setLoginTrigger] = useState(0); // Nuevo estado para forzar recarga del useEffect después del login

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se ejecuta al montar, en cambios de ruta, y cuando loginTrigger cambia (después del login)
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

        // Redirección automática solo para empleados (si no están ya en /dashboard-empleado)
        if (data?.id_empleado && location.pathname !== '/dashboard-empleado') {
          navigate('/dashboard-empleado');
        }
      })
      .catch(() => {
        setIsLogged(false);
        setIsOwner(false);
        setUserRole(null);
      });
  }, [loginTrigger]); // Agregado loginTrigger para que se ejecute después del login
  //location.pathname -> Hacia que cuando se cambiaba de ruta, se vuelva a recargar la direccion al dashboard-empleado si es empleado 

  // useEffect separado para loggear cambios en userRole (evita el bug del console.log inmediato)
  useEffect(() => {
    console.log("UserRole actualizado:", userRole);
  }, [userRole]);

  const login = () => {
    setIsLogged(true);
    setLoginTrigger(prev => prev + 1); // Incrementa el trigger para forzar el useEffect
  };

  const logout = () => {
    fetch("http://localhost:5000/usuarios/logout", {
      method: "POST",
      credentials: "include",
    })
    .finally(() => {
      setIsLogged(false);
      setIsOwner(false);
      setUserRole(null);
      setLoginTrigger(0); // Resetea el trigger al logout
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