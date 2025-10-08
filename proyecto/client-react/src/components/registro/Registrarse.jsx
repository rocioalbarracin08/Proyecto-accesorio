
export function Registrarse(){


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
            
            <a href="#" className="enlaces">Iniciar sesión</a>

        </section> 
        </>
    )
    }