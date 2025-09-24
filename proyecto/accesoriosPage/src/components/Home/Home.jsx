export function Home ({usuario,setUser}){
    const handleLogout = () =>{
        setUser([])
    }
    return(
    <main>
        <h1>Bienvenido {usuario}</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
    </main>)
}