import React from 'react';  // Agrega esta línea para usar JSX
import { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loginTrigger, setLoginTrigger] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // QUITA LA VERIFICACIÓN INICIAL DEL TOKEN: No podemos acceder a cookies httpOnly desde JS.
    // En su lugar, intenta los fetches directamente; si no hay token, fallarán con 401 y el catch los manejará.

    fetch("http://localhost:5000/usuarios/perfil", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        setIsLogged(res.ok);
        if (res.ok) {
          return res.json();  // Obtén los datos del perfil directamente aquí
        }
        throw new Error("No autorizado");  // Fuerza el catch si no es ok
      })
      .then((data) => {
        // Verifica si es dueño (basado en id_cliente e id_empleado null)
        const esDueno = !data.id_cliente && !data.id_empleado;
        setIsOwner(esDueno);

        // Setea userRole basado en los datos
        if (data.id_cliente) setUserRole('cliente');
        else if (data.id_empleado) setUserRole('empleado');
        else setUserRole('dueño');

        // Redirección automática solo para empleados
        if (data.id_empleado && location.pathname !== '/dashboard-empleado') {
          navigate('/dashboard-empleado');
        }
      })
      .catch(() => {
        // Si falla (ej. 401), resetea todo
        setIsLogged(false);
        setIsOwner(false);
        setUserRole(null);
      });
  }, [loginTrigger]);  // Solo depende de loginTrigger

  // useEffect separado para loggear cambios en userRole
  useEffect(() => {
    console.log("UserRole actualizado:", userRole);
  }, [userRole]);

  const login = () => {
    setLoginTrigger((prev) => prev + 1);  // Incrementa para forzar el useEffect
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
        setLoginTrigger(0);
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