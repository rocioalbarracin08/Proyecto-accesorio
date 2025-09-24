import { useEffect } from "react"

export default function useAuth() {

    const [usuario, setUsuario] = useState("")
    const [contraseña, setContraseña] = useState("")
    const [error, setError] = useState(false)

    useEffect(() => {
    
        // Aquí podrías agregar lógica para verificar si el usuario ya está autenticado
        // por ejemplo, verificando un token en localStorage o haciendo una petición a un servidor.
    }, [])

    return {usuario, setUsuario, contraseña, setContraseña, error, setError}
 
    //Lógica de autenticación
}