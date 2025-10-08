import useAuth from '../../hooks/useAuth';
import './register.css'
import { Link } from 'react-router-dom';

export function Registrarse(){
    const {usuario, setUsuario,repetirContraseña, setRepetirContraseña, contraseña, setContraseña, error, setError} = useAuth()//La lógica del programa va en el hook

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
            <h1>Registrarse</h1>
            {error ? <p>Por favor, complete todos los campos</p> : ""}
            <form className='formulario'>
                <input 
                type="text" 
                placeholder='Nombre y apellido' 
                onChange={handleInputUsuario}
                value={usuario}
                />
                <input 
                type="password" 
                placeholder='Cree una contraseña' 
                onChange={event => setContraseña(event.target.value)}
                value={contraseña}
                />
                <input 
                type="password" 
                placeholder='Repita la contraseña' 
                onChange={event => setContraseña(event.target.value)}
                value={repetirContraseña}
                />
            </form>

            <button onClick={handleClick}>Registrarse</button> 
            
            <Link to="/login" className="ultLink">¿Ya tenés una cuenta? </Link>
            
        </section> 
        
        </>
    );
}