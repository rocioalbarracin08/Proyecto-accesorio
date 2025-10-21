import React, { useState, useEffect } from 'react';  // useState: Para estado del índice actual; useEffect: Para timer automático
import { usePromociones } from '../contexts/PromocionesContext';  // usePromociones: Hook personalizado para acceder al contexto global de promociones

const CarruselPromociones = () => {
  const { promociones, loading, error } = usePromociones();  // Accede a promociones activas desde el contexto
  const [indiceActual, setIndiceActual] = useState(0);  // Estado para el índice de la promoción actual en el carrusel

  // Filtra solo promociones activas (basado en el backend, pero por si acaso)
  const promocionesActivas = promociones.filter(p => p.activo && new Date(p.fecha_fin) >= new Date());

  useEffect(() => {
    if (promocionesActivas.length === 0) return;  // Si no hay promociones, no hace nada

    // Timer automático: Cambia al siguiente índice cada 3 segundos
    const timer = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % promocionesActivas.length);  // Cicla al siguiente (vuelve a 0 al final)
    }, 3000);  // 3000 ms = 3 segundos

    return () => clearInterval(timer);  // Limpia el timer al desmontar el componente (previene memory leaks)
  }, [promocionesActivas.length]);  // Dependencia: Se reinicia si cambia el número de promociones

  if (loading) return <div className="carrusel-loading">Cargando promociones...</div>;
  if (error) return <div className="carrusel-error">{error}</div>;
  if (promocionesActivas.length === 0) return <div className="carrusel-vacio">No hay promociones activas</div>;

  const promocionActual = promocionesActivas[indiceActual];  // Obtiene la promoción actual basada en el índice

  return (
    <div className="carrusel-promociones">  {/* Contenedor principal del carrusel */}
      <div className="carrusel-imagen" style={{ backgroundImage: `url(${promocionActual.img_url || '/default-image.jpg'})` }}>  {/* Imagen de fondo; usa img_url o una por defecto */}
        <div className="carrusel-contenido">
          <h2>{promocionActual.descripcion}</h2>  {/* Descripción de la promoción */}
          <p>Descuento: {promocionActual.descuento} ({promocionActual.tipo_descuento})</p>  {/* Detalles del descuento */}
        </div>
      </div>
      <div className="carrusel-indicadores">  {/* Indicadores (puntos) debajo */}
        {promocionesActivas.map((_, index) => (  // Mapea para crear puntos por cada promoción
          <span 
            key={index} 
            className={`indicador ${index === indiceActual ? 'activo' : ''}`}  // Clase 'activo' para el punto actual
          ></span>
        ))}
        <div className="indicador-texto">  {/* Texto con número actual / total */}
          {indiceActual + 1} / {promocionesActivas.length}
        </div>
      </div>
    </div>
  );
};

export default CarruselPromociones;