import useAuth from '../../hooks/useAuth';
import './login.css'
import { Link } from 'react-router-dom';

export function Login(){
    const {usuario, setUsuario, contraseña, setContraseña, error, setError} = useAuth()//La lógica del programa va en el hook

    const handleClick = (event)=>{
        event.preventDefault()

        //Hacemos la comparación
        if (usuario === "" || contraseña === ""){
            return setError(true)
        }
        setError(false)
    }
    //Segunda forma de hace el evento al hacer click  
    const handleInputUsuario = (event) => {
        setUsuario(event.target.value); 
    };
    
    return(
        <>
        
        <section >
            <h1>Bienvenido</h1>
            {error ? <p>Por favor, complete todos los campos</p> : ""}
            <form className='formulario'>
                <input 
                type="text" 
                placeholder='Usuario' 
                onChange={handleInputUsuario}
                value={usuario}
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

        </section> 
        
        </>
    );
}