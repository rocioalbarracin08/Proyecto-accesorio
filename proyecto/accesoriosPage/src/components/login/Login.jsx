import 'login.css'


export function Login(){
    const [usuario, setUsuario] = useState("")
    const [contraseña, setConstraseña] = useState("")

    const handleClick = ()=>{
        //Hacemos la comparación
        if (usuario == "Ro" && contraseña == "Ro8"){
            
        }
    }

    return(
        <>
        <div className="contenedor-padre">
            <div >
                <h1 className="Bienvenido">Bienvenido</h1>
                
                <label htmlFor="title">Usuario</label>
                <input 
                type="text" 
                placeholder='Usuario' 
                onChange={handleInputChange}
                value={usuario}
                />

                <label htmlFor="clave">Contraseña</label>
                <input 
                type="password" 
                placeholder='Contraseña' 
                onChange={handleInputChange}
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