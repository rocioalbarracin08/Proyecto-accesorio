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
  // Nuevos estados para agregar preguntas
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");

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

  // Función para agregar nueva pregunta
  const agregarPregunta = () => {
    if (nuevaPregunta.trim() && nuevaRespuesta.trim()) {
      const nuevasPreguntas = [...data.preguntas, { pregunta: nuevaPregunta, respuesta: nuevaRespuesta }];
      setData({ ...data, preguntas: nuevasPreguntas });
      setNuevaPregunta("");
      setNuevaRespuesta("");
    }
  };

  // Función para guardar solo título y descripción
  const guardarCambios = () => {
    const cambios = { titulo: data.titulo, descripcion: data.descripcion };
    fetch("http://localhost:5000/nosotros", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(() => {
        alert("Cambio en título guardado exitosamente");
      })
      .catch(err => {
        console.error("Error al guardar cambios:", err);
        alert(`Error al guardar cambios: ${err.message}`);
      });
  };

  return (
    <main className="nosotros-container">
      <header className="nosotros-header">
        <h1 className="nosotros-title">{data.titulo}</h1>
        {isOwner && !isEditing && (
          <button className="nosotros-edit-btn" onClick={() => setIsEditing(true)}>Editar</button>
        )}
      </header>

      {isEditing ? (
        <section className="nosotros-edit-section">
          <label className="nosotros-edit-label">
            Título
            <input
              className="nosotros-edit-input"
              value={data.titulo}
              onChange={e => setData({ ...data, titulo: e.target.value })}
            />
          </label>
          
          <button className="nosotros-save-changes-btn" onClick={guardarCambios}>Guardar cambios</button>
          
          {/* Nueva sección para agregar preguntas */}
          <div className="nosotros-add-pregunta">
            <h3>Agregar Nueva Pregunta</h3>
            <input
              className="nosotros-edit-input"
              placeholder="Pregunta"
              value={nuevaPregunta}
              onChange={e => setNuevaPregunta(e.target.value)}
            />
            <textarea
              className="nosotros-edit-textarea"
              placeholder="Respuesta"
              value={nuevaRespuesta}
              onChange={e => setNuevaRespuesta(e.target.value)}
            />
            <button className="nosotros-add-btn" onClick={agregarPregunta}>Agregar Pregunta</button>
          </div>
          <button className="nosotros-save-btn" onClick={() => {
            fetch("http://localhost:5000/nosotros", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
              credentials: "include",
            })
              .then(res => {
                if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
                return res.json();
              })
              .then(() => {
                alert("Guardado exitosamente");
                setIsEditing(false);
              })
              .catch(err => {
                console.error("Error al guardar:", err);
                alert(`Error al guardar: ${err.message}`);
              });
          }}>
            Guardar
          </button>
          <button className="nosotros-cancel-btn" onClick={() => setIsEditing(false)}>Cancelar</button>
        </section>
      ) : (
        <>
          <section className="carrusel">
            <button className="carrusel-btn" onClick={() => setCurrent((current - 1 + data.imagenes.length) % data.imagenes.length)}>&lt;</button>
            <img className="carrusel-img" src={data.imagenes[current]} alt={`slide-${current}`} />
            <button className="carrusel-btn" onClick={() => setCurrent((current + 1) % data.imagenes.length)}>&gt;</button>
          </section>

          {/* Separador y sección de preguntas */}
          <hr className="nosotros-separator" />
          <section className="preguntas-section">
            <h2 className="preguntas-title">PREGUNTAS (CLIENTES)</h2>
            <div className="preguntas">
              {data.preguntas.map((item, idx) => (
                <article className="pregunta-item" key={idx}>
                  <button className="pregunta-btn" onClick={() => setOpen(open === idx ? null : idx)}>
                    {item.pregunta}
                  </button>
                  {open === idx && (
                    <div className="respuesta">
                      <p>{item.respuesta}</p>
                      {idx === 2 && (
                        <div className="mapa-container">
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
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}