import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(false);
  const location = useLocation();

  // Revalida el token cada vez que cambia la ruta
  useEffect(() => {
    fetch("http://localhost:5000/usuarios/perfil2", {
      method: "GET",
      credentials: "include",
    })
      .then(res => setIsLogged(res.ok))
      .catch(() => setIsLogged(false));
  }, [location]);

  //Para que sean globales estas dos variables
  const login = () => setIsLogged(true);
  const logout = () => setIsLogged(false);

  return (
    <AuthContext.Provider value={{ isLogged, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
