import React from 'react';
import { useState, useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import "./cambiarContrasena.css";

export default function CambiarContrasena() {
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const { logout } = useAuthContext();
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  // Referencias para los inputs
  const actualRef = useRef(null);
  const nuevaRef = useRef(null);
  const confirmRef = useRef(null);

  // Función para manejar Enter en actual: enfoca nueva
  const handleActualKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nuevaRef.current) {
        nuevaRef.current.focus();
      }
    }
  };

  // Función para manejar Enter en nueva: enfoca confirm
  const handleNuevaKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (confirmRef.current) {
        confirmRef.current.focus();
      }
    }
  };

  // Función para manejar Enter en confirm: ejecuta submit
  const handleConfirmKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e); // Llama a handleSubmit directamente
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Resetear error y mensaje
    setError("");
    setMensaje("");

    // Validaciones personalizadas
    if (!contrasenaActual.trim()) {
      return setError("La contraseña actual es obligatoria.");
    }
    if (!nuevaContrasena.trim()) {
      return setError("La nueva contraseña es obligatoria.");
    }
    if (nuevaContrasena.length < 6) {
      return setError("La nueva contraseña debe tener al menos 6 caracteres.");
    }
    if (!confirmPassword.trim()) {
      return setError("Debes confirmar la nueva contraseña.");
    }
    if (nuevaContrasena !== confirmPassword) {
      return setError("Las contraseñas no coinciden.");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/usuarios/cambiar_contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contrasena_actual: contrasenaActual, nueva_contrasena: nuevaContrasena }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.mensaje || "Contraseña cambiada exitosamente.");
        setContrasenaActual("");
        setNuevaContrasena("");
        setConfirmPassword("");
        // Llamamos a logout para actualizar el estado de autenticación
        logout();
        //navigate("/login"); Doble navigate, ya que logout ya lo hace (navegación redundante)
      } else {
        setError(data.error || "Error al cambiar la contraseña.");
        // Corregido: Loguear el error del servidor en lugar de 'err' indefinido
        console.error("Error en CambiarContrasena:", data.error);
      }
    } catch (error) {
      // Corregido: Capturar el error de la petición
      setError("Error de conexión con el servidor.");
      console.error("Error de conexión:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="cambiar-section">
      <h1>Cambiar Contraseña</h1>
      {mensaje && <p className="mensaje">{mensaje}</p>}
      {error && <p className="error">{error}</p>}
      <form className="cambiar-form" onSubmit={handleSubmit} noValidate> {/*Para deshabilitar la validación automáticamente del navegador*/}
        <div className="password-container">
          <input className='inputCC'
            ref={actualRef}
            type={showActual ? "text" : "password"}
            placeholder="Contraseña Actual"
            value={contrasenaActual}
            onChange={(e) => setContrasenaActual(e.target.value)}
            onKeyDown={handleActualKeyDown}  // Maneja Enter aquí
            required
          />
          <span className="password-toggle-icon" onClick={() => setShowActual(!showActual)}>
            {showActual ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="password-container">
          <input className='inputCC'
            ref={nuevaRef}
            type={showNueva ? "text" : "password"}
            placeholder="Nueva Contraseña"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            onKeyDown={handleNuevaKeyDown}  // Maneja Enter aquí
            required
          />
          <span className="password-toggle-icon" onClick={() => setShowNueva(!showNueva)}>
            {showNueva ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="password-container">
          <input className='inputCC'
            ref={confirmRef}
            type={showConfirm ? "text" : "password"}
            placeholder="Confirmar Nueva Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={handleConfirmKeyDown}  // Maneja Enter aquí
            required
          />
          <span className="password-toggle-icon" onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button className="btnCont" type="submit" disabled={loading}>
          {loading ? "Cambiando..." : "Confirmar Cambio"}
        </button>
        <Link to="/perfil" className="linkVolverPerfil">Volver al perfil</Link>
      </form>
    </section>
  );
}