import { useEffect, useState } from 'react'

export function ProductoInfo() {
    const [accesorios, setAccesorios] = useState([])

    //Cuando el componente inicia "se monta"
    useEffect(() => {
        fetch("http://localhost:3000/api/accesorios") //Petición, por defecto GET
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`); //Throw es para lanzar un error
            return res.json(); //Supuestamente este código lo hace mas eficiente
        })
        .then(data => setAccesorios(data))
        .catch(err => console.error("Fetch error:", err));
    }, [])

  return (
    <div>
        <h1>Accesorios</h1>
        <main>
            { accesorios.map( (producto) => (

                <li>
                    <h3>{producto.name}</h3>
                    <h2>{producto.categoria}</h2>
                    <h3>$ {producto.precio}</h3>
                </li>

            )) }
        </main>
    </div>
  ) 
}
