import { useState, useEffect } from 'react';
import { usePromociones } from '../../contexts/PromocionesContext';  // Importa el contexto
import './carruselPromociones.css';  // Importa el CSS específico

const CarruselPromociones = () => {
  const { promociones, loading, error } = usePromociones();  // Accede a promociones desde el contexto
  const [indiceActual, setIndiceActual] = useState(0);  // Estado para el índice actual

  // Filtra promociones activas
  const promocionesActivas = promociones.filter(p => p.activo && new Date(p.fecha_fin) >= new Date());

  useEffect(() => {
    if (promocionesActivas.length === 0) return;  // Si no hay promociones, no hace nada

    // Cambia al siguiente índice cada 3 segundos
    const timer = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % promocionesActivas.length);  // Cicla al siguiente
    }, 3000);  // 3000 ms = 3 segundos

    return () => clearInterval(timer);  // Limpia el timer al desmontar
  }, [promocionesActivas.length]);

  if (loading) return <div className="carrusel-loading">Cargando promociones...</div>;
  if (error) return <div className="carrusel-error">{error}</div>;
  if (promocionesActivas.length === 0) return <div className="carrusel-vacio">No hay promociones activas</div>;

  const promocionActual = promocionesActivas[indiceActual];  // Obtiene la promoción actual

  return (
    <div className="carrusel-promociones">
      <div className="carrusel-imagen" style={{ backgroundImage: `url(${promocionActual.img_url || '/default-image.jpg'})` }}>
        <div className="carrusel-contenido">
          
          <h2>{promocionActual.descripcion}</h2>
          <p>Descuento: {promocionActual.descuento} ({promocionActual.tipo_descuento})</p>
        </div>
      </div>
      <div className="carrusel-indicadores">
        {promocionesActivas.map((_, index) => (
          <span 
            key={index} 
            className={`indicador ${index === indiceActual ? 'activo' : ''}`} 
          ></span>
        ))}
        <div className="indicador-texto">
          {indiceActual + 1} / {promocionesActivas.length}
        </div>
      </div>
    </div>
  );
};


export default CarruselPromociones;
