import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./nosotros.css";

export default function Nosotros() {
  const [dataNosotros, setDataNosotros] = useState(null);
  const [dataPreguntas, setDataPreguntas] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(null);
  // Estados para agregar preguntas (solo a dataPreguntas)
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");

  // Función reutilizable para fetch datos
  const fetchData = () => {
    setError(null);
    console.log("Fetching /nosotros...");
    fetch("http://localhost:5000/nosotros", { credentials: "include" })
      .then(res => {
        console.log("Respuesta de /nosotros:", res.status);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then(payload => {
        console.log("Datos recibidos:", payload);
        console.log("dataNosotros:", payload.nosotros);
        console.log("dataPreguntas:", payload.preguntas);
        setDataNosotros(payload.nosotros || {});
        setDataPreguntas(payload.preguntas || { preguntas: [] });
      })
      .catch(err => {
        console.error('Error fetch /nosotros:', err);
        setError(err.message || String(err));
      });
  };

  useEffect(() => {
    fetchData();

    // Verificar si es dueño
    console.log("Verificando si es dueño...");
    fetch("http://localhost:5000/usuarios/es_dueno", { credentials: "include" })
      .then(res => res.json())
      .then(res => {
        console.log("Es dueño:", res.es_dueno);
        setIsOwner(res.es_dueno);
      })
      .catch(err => {
        console.error("Error verificando dueño:", err);
        setIsOwner(false);
      });
  }, []);

  if (error) return <div className="nosotros-error">Error cargando datos: {error}</div>;
  if (!dataNosotros || !dataPreguntas) return <p>Cargando...</p>;

  // Función para agregar nueva pregunta (a dataPreguntas, localmente)
  const agregarPregunta = () => {
    if (nuevaPregunta.trim() && nuevaRespuesta.trim()) {
      const nuevasPreguntas = [...dataPreguntas.preguntas, { pregunta: nuevaPregunta, respuesta: nuevaRespuesta }];
      setDataPreguntas({ ...dataPreguntas, preguntas: nuevasPreguntas });
      setNuevaPregunta("");
      setNuevaRespuesta("");
    }
  };

  // Guardar preguntas (envía a /nosotros/preguntas y refresca datos)
  const guardarPreguntas = () => {
    console.log("Guardando preguntas:", dataPreguntas);
    fetch("http://localhost:5000/nosotros/preguntas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataPreguntas),
      credentials: "include",
    })
      .then(res => {
        console.log("Respuesta de PUT preguntas:", res.status);
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(() => {
        alert("Preguntas guardadas exitosamente");
        // Refrescar datos para que el cliente vea cambios inmediatamente
        fetchData();
      })
      .catch(err => {
        console.error("Error al guardar preguntas:", err);
        alert(`Error al guardar preguntas: ${err.message}`);
      });
  };

  // Guardar cambios en nosotros
  const guardarCambios = () => {
    console.log("Guardando nosotros:", dataNosotros);
    fetch("http://localhost:5000/nosotros", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataNosotros),
      credentials: "include",
    })
      .then(res => {
        console.log("Respuesta de PUT nosotros:", res.status);
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(() => {
        alert("Nosotros guardado exitosamente");
        setIsEditing(false);
        // Refrescar datos
        fetchData();
      })
      .catch(err => {
        console.error("Error al guardar nosotros:", err);
        alert(`Error al guardar nosotros: ${err.message}`);
      });
  };

  return (
    <main className="nosotros-container">
      <header className="nosotros-header">
        <h1 className="nosotros-title">{dataNosotros.titulo}</h1>
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
              value={dataNosotros.titulo}
              onChange={e => setDataNosotros({ ...dataNosotros, titulo: e.target.value })}
            />
          </label>
          
          <label className="nosotros-edit-label">
            Descripción
            <textarea
              className="nosotros-edit-textarea"
              value={dataNosotros.descripcion}
              onChange={e => setDataNosotros({ ...dataNosotros, descripcion: e.target.value })}
            />
          </label>
          
          <button className="nosotros-save-btn" onClick={guardarCambios}>Guardar</button>
          <button className="nosotros-cancel-btn" onClick={() => setIsEditing(false)}>Cancelar</button>
        </section>
      ) : (
        <>
          <section className="nosotros-description">
            <p>{dataNosotros.descripcion}</p>
          </section>
          
          <section className="carrusel">
            {dataNosotros.imagenes.length > 0 ? (
              <>
                <button className="carrusel-btn" onClick={() => setCurrent((current - 1 + dataNosotros.imagenes.length) % dataNosotros.imagenes.length)}>&lt;</button>
                <img className="carrusel-img" src={dataNosotros.imagenes[current]} alt={`slide-${current}`} />
                <button className="carrusel-btn" onClick={() => setCurrent((current + 1) % dataNosotros.imagenes.length)}>&gt;</button>
              </>
            ) : (
              <p>No hay imágenes disponibles</p>
            )}
          </section>
        </>
      )}

      {/* Separador */}
      <hr className="nosotros-separator" />

      {/* Sección de preguntas (primero de id=1, luego de id=2) */}
      <section className="preguntas-section">
        {/* Preguntas de id=1 (arriba) */}
        {dataNosotros.preguntas && dataNosotros.preguntas.length > 0 && (
          <div className="preguntas-nosotros">
            <h3>Preguntas de Nosotros</h3>
            <div className="preguntas">
              {dataNosotros.preguntas.map((item, idx) => (
                <article className="pregunta-item" key={`nosotros-${idx}`}>
                  <button className="pregunta-btn" onClick={() => setOpen(open === `nosotros-${idx}` ? null : `nosotros-${idx}`)}>
                    {item.pregunta}
                  </button>
                  {open === `nosotros-${idx}` && (
                    <div className="respuesta">
                      <p>{item.respuesta}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Preguntas de id=2 (abajo de las de id=1) */}
        {dataPreguntas.preguntas.length > 0 && (
          <div className="preguntas-clientes">
            <div className="preguntas">
              {dataPreguntas.preguntas.map((item, idx) => (
                <article className="pregunta-item" key={`clientes-${idx}`}>
                  <button className="pregunta-btn" onClick={() => setOpen(open === `clientes-${idx}` ? null : `clientes-${idx}`)}>
                    {item.pregunta}
                  </button>
                  {open === `clientes-${idx}` && (
                    <div className="respuesta">
                      <p>{item.respuesta}</p>
                      {idx === 2 && (
                        <div className="mapa-container">
                          {typeof dataNosotros.ubicacion_lat === 'number' && typeof dataNosotros.ubicacion_lng === 'number' ? (
                            <MapContainer
                              center={[dataNosotros.ubicacion_lat, dataNosotros.ubicacion_lng]}
                              zoom={13}
                              style={{ width: "100%", height: "100%" }}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <Marker position={[dataNosotros.ubicacion_lat, dataNosotros.ubicacion_lng]}>
                                <Popup>{dataNosotros.ubicacion_descripcion}</Popup>
                              </Marker>
                            </MapContainer>
                          ) : (
                            <p>Ubicación no disponible</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        <h2 className="preguntas-title">PREGUNTAS (CLIENTES)</h2>
        
        {/* Formulario para agregar preguntas (solo si es dueño) */}
        {isOwner && (
          <div className="preguntas-edit-section">
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
            <button className="nosotros-save-changes-btn" onClick={guardarPreguntas}>Guardar Preguntas</button>
          </div>
        )}
      </section>
    </main>
  );
}