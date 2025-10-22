import useAuth from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext'; //hook global
import './login.css';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export function Login(){
    const { email, setEmail, contraseña, setContraseña, error, setError } = useAuth(); 
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");  // Aquí guardamos el error
    const navigate = useNavigate();
    const { login } = useAuthContext(); 

    const handleClick = async (event) => {
        event.preventDefault();

        if (email === "" || contraseña === "") {
            setError(true);
            setLoginError(""); // Limpiar el error si los campos están vacíos
            return;
        }
        setError(false);
        setLoginError(""); // Limpiar cualquier error anterior

        try {
            const response = await fetch("http://localhost:5000/usuarios/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password: contraseña,
                }),
                credentials: "include"
            });

            if (response.ok) {
                navigate("/");
                login(); // Loguea al usuario
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
            setLoginError("Error de conexión con el servidor.");
            setError(false);
        }
    };

    return (
        <>
        <section className='section-log'>
            <h1>Bienvenido</h1>
            {error ? <p>Por favor, complete todos los campos</p> : ""}
            {loginError && <p style={{ color: 'red' }}>{loginError}</p>} {/* Muestra el error si existe */}
            <form className='formulario'>
                <input 
                    type="text" 
                    placeholder='Email' 
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className='email-input'
                />
                <div className='password-container'>
                    <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder='Contraseña' 
                        onChange={event => setContraseña(event.target.value)}
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
