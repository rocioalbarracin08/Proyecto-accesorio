import { use, useEffect, useState } from "react"

export default function useAuth() {

    const [usuarioName, setUsuarioName] = useState("")
    const [usuarioApellido, setUsuarioApellido]= useState("")
    const [contraseña, setContraseña] = useState("")
    const [error, setError] = useState(false)
    const [repetirContraseña, setRepetirContraseña] = useState("")
    const [email, setEmail] = useState("")

    useEffect(() => {
    
        // Aquí podrías agregar lógica para verificar si el usuario ya está autenticado
        // por ejemplo, verificando un token en localStorage o haciendo una petición a un servidor.
    }, [])

    return {usuarioName, setUsuarioName, usuarioApellido, setUsuarioApellido, contraseña, setContraseña, error, setError, repetirContraseña, setRepetirContraseña,}
 
    //Lógica de autenticación
}