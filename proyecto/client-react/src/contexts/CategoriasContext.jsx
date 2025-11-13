import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CategoriasContext = createContext();

export const useCategorias = () => useContext(CategoriasContext);

export const CategoriasProvider = ({ children }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarCategorias = async () => {
    try {
      const res = await axios.get('http://localhost:5000/categoria', { withCredentials: true });
      setCategorias(res.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar categorías');
      setLoading(false);
    }
  };

  const eliminarCategoria = async (id) => {
    if (window.confirm('¿Eliminar categoría?')) {
      try {
        await axios.delete(`http://localhost:5000/categoria/${id}`, { withCredentials: true });
        cargarCategorias();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  const toggleActivo = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/categoria/${id}/estado`, {}, { withCredentials: true });
      cargarCategorias();
    } catch (err) {
      alert('Error al cambiar estado');
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  return (
    <CategoriasContext.Provider value={{ categorias, loading, error, cargarCategorias, eliminarCategoria, toggleActivo }}>
      {children}
    </CategoriasContext.Provider>
  );
};
export {CategoriasContext}