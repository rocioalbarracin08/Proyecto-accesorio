import 'login.css'
import  {useState} from "react";

export function Login(){
    const [usuario, setUsuario] = useState("")
    const [contraseña, setContraseña] = useState("")
    const [ mensaje, setMensaje] = useState("")

    const handleClick = (usuario)=>{
        //Hacemos la comparación
        if (usuario === "Ro" && contraseña === "Ro8"){
            console.log("Usuario y contraseña correcta")
        }else if (usuario === "Ro" && contraseña != "Ro8"){
            console.log("contraseña incorrecta")
        }else if (usuario != "Ro" && contraseña === "Ro8"){
            console.log("usuario incorrecto")
        }else if (usuario != "Ro" && contraseña != "Ro8"){
            console.log("contraseña incorrecta")
        }else if (usuario != "" && contraseña != ""){
            console.log("contraseña")
        }
    }

    const handleInputUsuario = (event) => {
        setUsuario(event.target.value); 
    };
    const handleInputContraseña = (event) => {
        setContraseña(event.target.value); 
    };

    return(
        <>
        <div className="contenedor-padre">
            <div >
                <h1>Bienvenido</h1>
                <h3>{mensaje}</h3>
                
                <label htmlFor="title">Usuario</label>
                <input 
                type="text" 
                placeholder='Usuario' 
                onChange={handleInputUsuario}
                value={usuario}
                />

                <label htmlFor="clave">Contraseña</label>
                <input 
                type="password" 
                placeholder='Contraseña' 
                onChange={handleInputContraseña}
                value={contraseña}
                />

                <button onClick={handleClick} >Mostrar</button> 
                
                <a href="#" className="enlaces">¿Perdiste tu contraseña?</a>
                <a href="#" className="enlaces">¿No tienes cuenta? Registrate</a>

            </div> 
            <a href="#" target="_blank" className="volver">Volver</a>
        </div>
        </>
    );
}