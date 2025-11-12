import { useState, useEffect } from "react";
import "./promosBanner.css";

export default function CarruselPromociones() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indice, setIndice] = useState(0);
  const [error, setError] = useState(null);

  // Llama al endpoint de Flask
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch("http://localhost:5000/promociones?activas=true");
        const data = await res.json();
        if (Array.isArray(data)) setPromos(data);
        else throw new Error(data.error || "Error desconocido");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  // Avanza automáticamente cada 3 segundos
  useEffect(() => {
    if (promos.length === 0) return;
    const timer = setInterval(() => {
      setIndice((prev) => (prev + 1) % promos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [promos]);

  if (loading) return <div className="carrusel-loading">Cargando promociones...</div>;
  if (error) return <div className="carrusel-error">{error}</div>;
  if (promos.length === 0) return <div className="carrusel-vacio">No hay promociones activas</div>;

  const promo = promos[indice];

  return (
    <div className="carrusel-textual">
      <p className="promo-texto">
        🛒 {promo.descripcion} — {promo.descuento}
        {promo.tipo_descuento === "porcentaje" ? "%" : "$"} de descuento
        {promo.producto ? ` en ${promo.producto}` : ""}
        {promo.categoria ? ` (${promo.categoria})` : ""}
      </p>
    </div>
  );
}
