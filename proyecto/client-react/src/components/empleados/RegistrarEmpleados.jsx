import React from "react";
import { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { FaEye, FaEyeSlash, FaEdit, FaToggleOn, FaToggleOff } from "react-icons/fa";  // Íconos actualizados
import { Link, useNavigate } from "react-router-dom";
import "./registrarEmpleados.css";

export default function RegistrarEmpleado() {
  // Estados para registro
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idTienda, setIdTienda] = useState("");
  const [puestoTrabajo, setPuestoTrabajo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [genero, setGenero] = useState("");
  const [tiendas, setTiendas] = useState([]);
  const [loadingTiendas, setLoadingTiendas] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados para lista y edición
  const [empleados, setEmpleados] = useState([]);
  const [editando, setEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Estados para edición
  const [editNombre, setEditNombre] = useState("");
  const [editApellido, setEditApellido] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPuestoTrabajo, setEditPuestoTrabajo] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editGenero, setEditGenero] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const { isOwner } = useAuthContext();
  const navigate = useNavigate();

  // Cargar tiendas
  useEffect(() => {
    const fetchTiendas = async () => {
      try {
        const response = await fetch("http://localhost:5000/tienda/", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setTiendas(data);
        } else {
          setError("Error al cargar tiendas.");
        }
      } catch (err) {
        setError("Error de conexión al cargar tiendas.");
      } finally {
        setLoadingTiendas(false);
      }
    };
    fetchTiendas();
  }, []);

  // Cargar empleados
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await fetch("http://localhost:5000/empleados/listar", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setEmpleados(data);
        } else {
          setError("Error al cargar empleados.");
        }
      } catch (err) {
        setError("Error de conexión.");
      }
    };
    if (isOwner) fetchEmpleados();
  }, [isOwner]);

  // Verificar acceso
  useEffect(() => {
    if (!isOwner) {
      setError("Acceso denegado. Solo el dueño puede gestionar empleados.");
      navigate("/");
    }
  }, [isOwner, navigate]);

  // Registrar empleado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre || !apellido || !email || !idTienda || !puestoTrabajo || !telefono || !password || !genero) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/empleados/registro_por_dueno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre, apellido, email, id_tienda: parseInt(idTienda), puesto_trabajo: puestoTrabajo, telefono, genero, password,
        }),
        credentials: "include",
      });

      if (response.ok) {
        alert("Empleado registrado exitosamente.");
        // Limpiar campos
        setNombre(""); setApellido(""); setEmail(""); setIdTienda(""); setPuestoTrabajo(""); setTelefono(""); setGenero(""); setPassword("");
        // Recargar lista
        const res = await fetch("http://localhost:5000/empleados/listar", { credentials: "include" });
        if (res.ok) setEmpleados(await res.json());
      } else {
        const data = await response.json();
        setError(data.error || "Error al registrar empleado.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle activar/desactivar
  const toggleEmpleado = async (id_empleado) => {
    try {
      const response = await fetch(`http://localhost:5000/empleados/desactivar/${id_empleado}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (response.ok) {
        // Recargar lista
        const res = await fetch("http://localhost:5000/empleados/listar", { credentials: "include" });
        if (res.ok) setEmpleados(await res.json());
      } else {
        setError("Error al cambiar estado.");
      }
    } catch (err) {
      setError("Error de conexión.");
    }
  };

  // Abrir editar
  const abrirEditar = (empleado) => {
    if (empleado.activo === 0) return;  // No editar inactivos
    setEditando(empleado);
    setEditNombre(empleado.nombre);
    setEditApellido(empleado.apellido);
    setEditEmail(empleado.email);
    setEditPuestoTrabajo(empleado.puesto_trabajo);
    setEditTelefono(empleado.telefono);
    setEditGenero(empleado.genero);
    setEditPassword("");
    setShowModal(true);
  };

  // Guardar edición
  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/empleados/editar/${editando.id_empleado}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editNombre, apellido: editApellido, email: editEmail,
          puesto_trabajo: editPuestoTrabajo, telefono: editTelefono, genero: editGenero,
          password: editPassword || undefined, 
        }),
        credentials: "include",
      });
      if (response.ok) {
        const res = await fetch("http://localhost:5000/empleados/listar", { credentials: "include" });
        if (res.ok) setEmpleados(await res.json());
        setShowModal(false);
        alert("Empleado actualizado.");
      } else {
        setError("Error al actualizar.");
      }
    } catch (err) {
      setError("Error de conexión.");
    }
  };

  if (!isOwner) return <p>Redirigiendo...</p>;

  return (
    <section className="section-registrar-empleado">
      <h1 className="h1-e">Gestión de Empleados</h1>
      {error && <p className="error-message">{error}</p>}

      {/* Sección de Registro */}
      <div className="registro-section">
        <h2>Registrar Nuevo Empleado</h2>
        <form onSubmit={handleSubmit} className="formRegistrarEmpleado">
          <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {loadingTiendas ? <p>Cargando tiendas...</p> : (
            <select value={idTienda} onChange={(e) => setIdTienda(e.target.value)} required className="select-tienda">
              <option value="">Selecciona una Tienda</option>
              {tiendas.map((tienda) => (
                <option key={tienda.id_tienda} value={tienda.id_tienda}>
                  {tienda.nombre} - {tienda.ubicacion} (ID: {tienda.id_tienda})
                </option>
              ))}
            </select>
          )}
          <input type="text" placeholder="Puesto de Trabajo" value={puestoTrabajo} onChange={(e) => setPuestoTrabajo(e.target.value)} required />
          <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
          <div className="input-password">
            <input type={showPassword ? "text" : "password"} placeholder="Cree una contraseña" onChange={(e) => setPassword(e.target.value)} value={password} required />
            <span onClick={() => setShowPassword(!showPassword)} className="span-eye">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <h5 className="generoH">Indique su género</h5>
          <div className="genero">
            <button type="button" className={genero === "M" ? "M active" : "M"} onClick={() => setGenero("M")}>Masculino</button>
            <button type="button" className={genero === "F" ? "F active" : "F"} onClick={() => setGenero("F")}>Femenino</button>
          </div>
          <button type="submit" disabled={loading || loadingTiendas} className="btnRegist">
            {loading ? "Registrando..." : "Registrar Empleado"}
          </button>
        </form>
      </div>

      {/* Sección de Lista */}
      <div className="lista-section">
        <h2>Empleados Registrados</h2>
        <ul className="empleados-lista">
          {empleados.map(e => (
            <li key={e.id_empleado} className={`empleado-item ${e.activo === 0 ? 'inactivo' : ''}`}>
              <div>
                <strong>{e.nombre} {e.apellido}</strong> - {e.email} - {e.puesto_trabajo} - {e.tienda_nombre}
              </div>
              <div>
                <button onClick={() => abrirEditar(e)} className="btn-edit" disabled={e.activo === 0}><FaEdit /> Editar</button>
                <button onClick={() => toggleEmpleado(e.id_empleado)} className="btn-toggle">
                  {e.activo === 1 ? <FaToggleOn /> : <FaToggleOff />} {e.activo === 1 ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal para Editar */}
      {showModal && (
        <div className="modal-overlayE">
          <div className="modal-contentEmp">
            <h2>Editar Empleado</h2>
            <form onSubmit={guardarEdicion} className="formRegistrarEmpleado">
              <input type="text" placeholder="Nombre" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} required />
              <input type="text" placeholder="Apellido" value={editApellido} onChange={(e) => setEditApellido(e.target.value)} required />
              <input type="email" placeholder="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
              <input type="text" placeholder="Puesto de Trabajo" value={editPuestoTrabajo} onChange={(e) => setEditPuestoTrabajo(e.target.value)} required />
              <input type="text" placeholder="Teléfono" value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} required />
              <div className="input-password">
                <input type={showPassword ? "text" : "password"} placeholder="Nueva contraseña (opcional)" onChange={(e) => setEditPassword(e.target.value)} value={editPassword} />
                <span onClick={() => setShowPassword(!showPassword)} className="span-eye">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="genero">
                <button type="button" className={editGenero === "M" ? "M active" : "M"} onClick={() => setEditGenero("M")}>Masculino</button>
                <button type="button" className={editGenero === "F" ? "F active" : "F"} onClick={() => setEditGenero("F")}>Femenino</button>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-submit">Guardar Cambios</button>
                <button onClick={() => setShowModal(false)} className="btn-cancel">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Link to="/" className="volver-link">Volver a inicio</Link>
    </section>
  );
}