import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PromocionesContext = createContext();

export const PromocionesProvider = ({ children }) => {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarPromociones = async () => {
    try {
      const response = await axios.get('http://localhost:5000/promociones', { withCredentials: true });
      setPromociones(response.data);
    } catch (err) {
      setError('Error al cargar promociones');
    } finally {
      setLoading(false);
    }
  };

  const eliminarPromocion = async (id) => {
    if (window.confirm('¿Eliminar promoción?')) {
      try {
        await axios.delete(`http://localhost:5000/promociones/${id}`, { withCredentials: true });
        cargarPromociones();
      } catch (err) {
        setError('Error al eliminar');
      }
    }
  };

  const desactivarPromocion = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/promociones/${id}/desactivar`, {}, { withCredentials: true });
      cargarPromociones();
    } catch (err) {
      setError('Error al desactivar');
    }
  };

  useEffect(() => {
    cargarPromociones();
  }, []);

  const value = {
    promociones,
    loading,
    error,
    cargarPromociones,
    eliminarPromocion,
    desactivarPromocion
  };

  return (
    <PromocionesContext.Provider value={value}>
      {children}
    </PromocionesContext.Provider>
  );
};

export const usePromociones = () => {
  const context = useContext(PromocionesContext);
  if (!context) {
    throw new Error('usePromociones debe usarse dentro de PromocionesProvider');
  }
  return context;
};