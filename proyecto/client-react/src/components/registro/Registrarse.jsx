import useAuth from '../../hooks/useAuth';
import './register.css'
import { Link } from 'react-router-dom';

export function Registrarse(){
    const {usuarioName, setUsuarioName, repetirContraseña, setRepetirContraseña, contraseña, setContraseña, error, setError, usuarioApellido, setUsuarioApellido} = useAuth()//La lógica del programa va en el hook

    const [genero, setGenero] = useState('');

    const handleClick = (event)=>{
        event.preventDefault()

        //Hacemos la comparación
        if (usuario === "" || contraseña === "" || repetirContraseña === ""){
            return setError(true)
        }
        setError(false)
    }
    //Segunda forma de hace el evento al hacer click  
    const handleInputUsuario = (event) => {
        setUsuarioName(event.target.value); 
    };
    const handleInputUsuarioApellido = (e) =>{
        setUsuarioApellido(e.target.value)
    }

    
    return(
        <>
        <section >
            <h1>Registrarse</h1>
            {error ? <h7>Por favor, complete todos los campos</h7> : ""}
            <form className='formulario'>
                <input 
                type="text" 
                placeholder='Nombre' 
                onChange={handleInputUsuario}
                value={usuarioName}
                />
                <input 
                type="text" 
                placeholder='Apellido' 
                onChange={handleInputUsuarioApellido}
                value={usuarioApellido}
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
                onChange={event => setRepetirContraseña(event.target.value)}
                value={repetirContraseña}
                />
                
                <h5 className='generoH'>Indique su género</h5>
                <div className='genero'>
                    <button className='M'onClick={() => setGenero('M')}>Femenino</button>
                    <button className='F'onClick={() => setGenero('F')}>Masculino</button>
                </div>
                
            </form>

            <button onClick={handleClick}>Registrarse</button> 
            
            <Link to="/login" className="ultLink">¿Ya tenés una cuenta? </Link>
            
        </section> 
        
        </>
    );
}