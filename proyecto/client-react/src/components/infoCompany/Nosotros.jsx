import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./nosotros.css";

export default function Nosotros() {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    // Datos principales
    fetch("http://localhost:5000/nosotros", { credentials: "include" })
      .then(res => res.json())
      .then(setData)
      .catch(console.error);

    // Verificar si es dueño
    fetch("http://localhost:5000/usuarios/es_dueno", { credentials: "include" })
      .then(res => res.json())
      .then(res => setIsOwner(res.es_dueno))
      .catch(() => setIsOwner(false));
  }, []);

  if (!data) return <p>Cargando...</p>;

  return (
    <main className="nosotros-container">
      <header>
        <h1>{data.titulo}</h1>
        {isOwner && !isEditing && (
          <button onClick={() => setIsEditing(true)}>Editar</button>
        )}
      </header>

      {isEditing ? (
        <section>
          <label>
            Título
            <input
              value={data.titulo}
              onChange={e => setData({ ...data, titulo: e.target.value })}
            />
          </label>
          <label>
            Descripción
            <textarea
              value={data.descripcion}
              onChange={e =>
                setData({ ...data, descripcion: e.target.value })
              }
            />
          </label>
          <button
            onClick={() => {
              fetch("http://localhost:5000/nosotros", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
              })
                .then(() => setIsEditing(false))
                .catch(() => alert("Error al guardar"));
            }}
          >
            Guardar
          </button>
          <button onClick={() => setIsEditing(false)}>Cancelar</button>
        </section>
      ) : (
        <>
          <section className="carrusel">
            <button onClick={() => setCurrent((current - 1 + data.imagenes.length) % data.imagenes.length)}>&lt;</button>
            <img src={data.imagenes[current]} alt={`slide-${current}`} />
            <button onClick={() => setCurrent((current + 1) % data.imagenes.length)}>&gt;</button>
          </section>

          <section className="preguntas">
            {data.preguntas.map((item, idx) => (
              <article key={idx}>
                <button onClick={() => setOpen(open === idx ? null : idx)}>
                  {item.pregunta}
                </button>
                {open === idx && (
                  <div>
                    <p>{item.respuesta}</p>
                    {idx === 2 && (
                      <aside style={{ height: 400 }}>
                        <MapContainer
                          center={[data.ubicacion_lat, data.ubicacion_lng]}
                          zoom={13}
                          style={{ width: "100%", height: "100%" }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[data.ubicacion_lat, data.ubicacion_lng]}>
                            <Popup>{data.ubicacion_descripcion}</Popup>
                          </Marker>
                        </MapContainer>
                      </aside>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
