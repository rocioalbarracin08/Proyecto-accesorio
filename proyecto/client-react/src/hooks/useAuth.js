import { use, useEffect, useState } from "react"

export default function useAuth() {

    const [usuario, setUsuario] = useState("")
    const [contraseña, setContraseña] = useState("")
    const [error, setError] = useState(false)
    const [repetirContraseña, setRepetirContraseña] = useState("")

    useEffect(() => {
    
        // Aquí podrías agregar lógica para verificar si el usuario ya está autenticado
        // por ejemplo, verificando un token en localStorage o haciendo una petición a un servidor.
    }, [])

    return {usuario, setUsuario, contraseña, setContraseña, error, setError, repetirContraseña, setRepetirContraseña}
 
    //Lógica de autenticación
}