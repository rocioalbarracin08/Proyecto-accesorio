import useAuth from '../../hooks/useAuth';
import './login.css'

export function Login({setUser}){
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
            <a href="#" className="enlaces">¿No tenés cuenta? Registrate</a>

        </section> 
        
        </>
    );
}