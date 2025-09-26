import { useEffect, useState } from 'react'
import './producto.css'

export function ProductoInfo() {
    const [accesorios, setAccesorios] = useState([])
    const [carrito, setCarrito] = useState([]);

    //Cuando el componente inicia "se monta"
    useEffect(() => {
        fetch("http://localhost:3000/api/accesorios") //Petición, por defecto GET
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`); //Throw es para lanzar un error
            return res.json(); //Supuestamente este código lo hace mas eficiente
        })
        .then(data => setAccesorios(data))
        .catch(error => console.error("Fetch error:", error));
    }, [])

    const agregarAlCarrito = (producto) => {

        setCarrito((valorAntCarrito) => { //
            //La variable que se crea es prevCarrito.find para buscar coincidencia si ya exite un articulo del identico al seleccionado para solo agregarle cantidad
            const existe = valorAntCarrito.find((item) => item.id === producto.id);
    
            if (existe) { // si ya está en el carrito
                return valorAntCarrito.map((item) =>
                    item.id === producto.id 
                    ? { ...item, cantidad: item.cantidad + 1 } //aumento la cantidad
                    : item /*SINO dejo el item como estaba*/
                );
            }
            else {
                // si no está, lo agrego con cantidad 1
                return [...valorAntCarrito, { ...producto, cantidad: 1 }]; /*¿No conviene esto en vez de la tabla intermedia de la db?*/
            }
        });
    };
    

  return (
    <div>
        <h1>Accesorios</h1>
        <main className='productos-grilla'>
            { accesorios.map( (producto) => ( /*Por cada producto imprimimos*/

                <div className='card' key={producto.id}>
                    <h3>{producto.name}</h3>
                    <p>{producto.categoria}</p>
                    <h3>$ {producto.precio}</h3>

                    <button onClick={() => agregarAlCarrito(producto.id)}><img src="/logos/carrito.png" alt="Añadir al carrito" /></button>

                    <ul>
                        {carrito.map((item) => ( /*El key es obligatorio en listas, para identificar cada producto -> ¿A que elemento de la lista correspone a cada dato?*/

                            <li key={item.id}> 
                                {item.name} - ${item.precio} x {item.cantidad}
                            </li>

                        ))}
                    </ul>
                </div>

            )) }
        </main>
    </div>
  ) 
}
