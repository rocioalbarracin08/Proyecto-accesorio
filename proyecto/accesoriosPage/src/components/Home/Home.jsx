
export function Home ({usuario,setUser}){
    const handleCerrarSesion = () =>{
        setUser([])
    }
    return(
    <main>
        <h1>Bienvenido {usuario}</h1>
        <button onClick={handleCerrarSesion}>Cerrar Sesión</button>
    </main>)
}