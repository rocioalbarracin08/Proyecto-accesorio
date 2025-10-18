import useAuth from '../../hooks/useAuth';
import { useAuthContext } from '../../context/AuthContext'; //hook global
import './login.css';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export function Login(){
    const {email, setEmail, contraseña, setContraseña, error, setError} = useAuth(); //La lógica del programa va en el hook
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuthContext(); //hook global

    const handleClick = async (event) => {
        event.preventDefault();

        if (email === "" || contraseña === "") {
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
                    email,
                    password: contraseña,
                }),
                credentials: "include" // Importante para manejar cookies (tokens) en el navegador
            });
            if (response.ok) {
                navigate("/");
                login(); //marca logueado instantáneamente
            } else {
                const data = await response.json();
                if (data && data.error === "Credenciales incorrectas") {
                    setLoginError("La contraseña no coincide con el email ingresado.");
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
    return(
        <>
        
        <section className='section-log'>
            <h1>Bienvenido</h1>
            {error ? <p>Por favor, complete todos los campos</p> : ""}
            {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
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
                        className='password-toggle-icon'
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
            </form>

            <button onClick={handleClick} className='btn-log'>Iniciar sesión</button> 
            
            <Link to="/recuperar-contrasena" className='enlaces'>¿Olvidaste tu contraseña?</Link>
            <Link to="/registro">¿No tenés cuenta? Registrate</Link>
            <Link to="/" className='ultLink'>Volver</Link>

        </section> 
        </>
    );
}