import { useState, useEffect } from 'react';
import { usePromociones } from '../../contexts/PromocionesContext';
import './carruselPromociones.css';

const CarruselPromociones = () => {
  const { promociones, loading, error } = usePromociones();
  const [indiceActual, setIndiceActual] = useState(0);

  // Función auxiliar para obtener la fecha actual como Date (sin hora)
  const getFechaActual = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);  // Resetea horas para comparar solo fechas
    return hoy;
  };

  // Filtra promociones activas: activo=true, fecha_inicio <= hoy <= fecha_fin
  const promocionesActivas = promociones.filter(p => {
    // Maneja activo como int (0/1), string ("0"/"1") o bool
    const isActiva = p.activo === 1 || p.activo === "1" || p.activo === true;
    if (!isActiva) return false;

    const hoy = getFechaActual();
    const inicio = new Date(p.fecha_inicio);  // Convierte string a Date
    const fin = new Date(p.fecha_fin);

    // Verifica que las fechas sean válidas y estén en rango
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return false;  // Si no son fechas válidas, excluye

    // Compara fechas (sin horas)
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    return inicio <= hoy && hoy <= fin;
  });

  useEffect(() => {
    if (promocionesActivas.length === 0) return;

    const timer = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % promocionesActivas.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [promocionesActivas.length]);

  if (loading) return <div className="carrusel-loading">Cargando promociones...</div>;
  if (error) return <div className="carrusel-error">{error}</div>;
  if (promocionesActivas.length === 0) return <div className="carrusel-vacio">No hay promociones activas</div>;

  const promocionActual = promocionesActivas[indiceActual];

  return (
    <div className="carrusel-promociones">
      <div className="carrusel-imagen" style={{ backgroundImage: `url(${promocionActual.img_url || '/default-image.jpg'})` }}>
        <div className="carrusel-contenido">
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
