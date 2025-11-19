import React from "react";
import useAuth from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext'; //hook global
import './login.css';
import { useState, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export function Login() {
  const { email, setEmail, contraseña, setContraseña, error, setError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(""); // Aquí guardamos el error
  const navigate = useNavigate();
  const { login } = useAuthContext();

  // Referencias para los inputs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleClick = async (event) => {
    event.preventDefault();
    
    // Debug: imprime los valores para verificar si llegan correctamente
    console.log("Email:", email, "Contraseña:", contraseña);
    
    // Validación con trim() para ignorar espacios
    if (email.trim() === "" || contraseña.trim() === "") {
      setError(true);
      setLoginError("");
      return;
    }
    setError(false);
    setLoginError("");

    try {
      const response = await fetch("http://localhost:5000/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(), // Envía sin espacios
          password: contraseña.trim(),
        }),
        credentials: "include",
      });

      if (response.ok) {
        login(); // Llama a login() del contexto
        navigate("/"); // Navega a home
      } else {
        const data = await response.json();
        if (data && data.error === "La contraseña es incorrecta") {
          setLoginError("Contraseña incorrecta. Intenta nuevamente.");
        } else {
          setLoginError("Error al iniciar sesión. Intente nuevamente.");
        }
        setError(false);
      }
    } catch (err) {
      console.error("Error al conectar con el servidor:", err);
      setError(false);
      setLoginError("Error de conexión con el servidor");
    }
  };

  // Función para manejar Enter en email: enfoca password
  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (passwordRef.current) {
        passwordRef.current.focus();
      }
    }
  };

  // Función para manejar Enter en password: ejecuta submit
  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick(e); // Llama a handleClick directamente
    }
  };

  return (
    <>
      <section className='section-log'>
        <h1>Bienvenido</h1>
        {error ? <p>Por favor, complete todos los campos</p> : ""}
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        <form className='formulario'>
          <input 
            ref={emailRef}
            type="email"  // Cambié a "email" para mejor validación
            placeholder='Email' 
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleEmailKeyDown}  // Maneja Enter aquí
            value={email}
            className='email-input'
          />
          <div className='password-container'>
            <input 
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'} 
              placeholder='Contraseña' 
              onChange={(event) => setContraseña(event.target.value)}
              onKeyDown={handlePasswordKeyDown}  // Maneja Enter aquí
              value={contraseña}
              className='password-input'
            />
            <span 
              onClick={() => setShowPassword((prev) => !prev)}
              className='password-icon'
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </form>

        <button onClick={handleClick} className='btn-log'>Iniciar sesión</button> 
        
        <Link to="/recuperar-contrasena" className='LinksLog'>¿Olvidaste tu contraseña?</Link>
        <Link to="/registro" className='LinksLog'>¿No tenés cuenta? Registrate</Link>
        <Link to="/" className='ultLink'>Volver</Link>
      </section> 
    </>
  );
}