import useAuth from '../../hooks/useAuth';
import './login.css'
import { Link } from 'react-router-dom';

export function Login(){
    const {email, setEmail, contraseña, setContraseña, error, setError} = useAuth()//La lógica del programa va en el hook

    const handleClick = async (event)=>{
        event.preventDefault()

        //Hacemos la comparación
        if (email === "" || contraseña === ""){
            return setError(true)
        }
        setError(false)

        // Enviar datos al backend
        try {
            const response = await fetch("http://localhost:5000/usuarios/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password: contraseña,
            }),
            });
            if (response.ok) {
            navigate("/login");
            //navigate(-1)
            } else {
            setError(true); // Error en el registro
            }
        } 
        catch (err) {
            setError(true);
        }
    };

    return(
        <>
        
        <section >
            <h1>Bienvenido</h1>
            {error ? <p>Por favor, complete todos los campos</p> : ""}
            <form className='formulario'>
                <input 
                type="text" 
                placeholder='Email' 
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                />

                <input 
                type="password" 
                placeholder='Contraseña' 
                onChange={event => setContraseña(event.target.value)}
                value={contraseña}
                />
            </form>

            <button onClick={handleClick}>Iniciar sesión</button> 
            
            <a href="#" className="enlaces">¿Perdiste tu contraseña?</a>
            <Link to="/registro" className="ultLink">¿No tenés cuenta? Registrate</Link>
            <Link to="/">Volver</Link>

        </section> 
        </>
    );
}