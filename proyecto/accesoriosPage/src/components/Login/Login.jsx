import 'login.css'
import  {useState} from "react";

export function Login({setUser}){
    const [usuario, setUsuario] = useState("")
    const [contraseña, setContraseña] = useState("")
    const [error, setMensaje] = useState(false)

    const handleClick = (event)=>{
        event.preventDefault()

        //Hacemos la comparación
        if (usuario === "" || contraseña === ""){
            return setMensaje(true)
        }
        setMensaje(false)

        setUser([nombre])
        /*if (usuario === "Ro" && contraseña === "Ro8"){
            console.log("Usuario y contraseña correcta")
        }else if (usuario === "Ro" && contraseña != "Ro8"){
            console.log("contraseña incorrecta")
        }else if (usuario != "Ro" && contraseña === "Ro8"){
            console.log("usuario incorrecto")
        }else if (usuario != "Ro" && contraseña != "Ro8"){
            console.log("contraseña incorrecta")
        }else if (usuario != "" && contraseña != ""){
            console.log("contraseña")
        }*/

    }

    const handleInputUsuario = (event) => {
        setUsuario(event.target.value); 
    };
    const handleInputContraseña = (event) => {
        setContraseña(event.target.value); 
    };

    return(
        <>
        <section >
            <h1>Bienvenido</h1>
            <p>{mensaje}</p>
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
                onChange={handleInputContraseña}
                value={contraseña}
                />
            </form>

            <button onClick={handleClick} >Mostrar</button> 
            
            <a href="#" className="enlaces">¿Perdiste tu contraseña?</a>
            <a href="#" className="enlaces">¿No tienes cuenta? Registrate</a>

        </section> 
        <a href="#" target="_blank" className="volver">Volver</a>
        </>
    );
}