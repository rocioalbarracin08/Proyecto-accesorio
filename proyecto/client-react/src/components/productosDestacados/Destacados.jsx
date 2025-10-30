import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Para llevar a productos
import "./destacados.css";

export function Destacados() {
    const [destacados, setDestacados] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5000/productos/destacados")
            .then(res => res.json())
            .then(data => setDestacados(data.destacados || []))
            .catch(err => setError(err.message));
    }, []);

    if (error) return <p>Error cargando destacados: {error}</p>;

    return (
        <section className="seccion-img">
            {destacados.length > 0 ? (
                destacados.map(prod => (
                    <Link key={prod.id_producto} to={`/productos/${prod.id_categoria}`}> {/* Enlaza a la categoría o producto */}
                        <img src={prod.imagen_url} alt={prod.name} title={`${prod.name} - $${prod.precio}`} />
                    </Link>
                ))
            ) : (
                <p>No hay productos destacados disponibles</p>
            )}
        </section>
    );
}