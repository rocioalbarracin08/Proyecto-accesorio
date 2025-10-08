import { useEffect, useState } from 'react'
import './producto.css'

export function Producto() {
    const [accesorios, setAccesorios] = useState([])
    const [carrito, setCarrito] = useState([]);

    //Cada vez que el componente se renderiza
    useEffect(() => {
        fetch("http://localhost:3000/roProductos//mostrar")
        .then((res) => res.json()) //El pedido en JSON
        .then( data => setAccesorios(data)) 
        .catch( err => console.error("Fetch error:", err));
    }, [])

    const agregarAlCarrito = (producto) => {

        setCarrito((carritoAnterior) => { 
            //La variable que se crea es prevCarrito.find para buscar coincidencia si ya exite un articulo del identico al seleccionado para solo agregarle cantidad
            const existe = carritoAnterior.find((item) => item.id === producto.id);
    
            if (existe) { // si ya está en el carrito
                return carritoAnterior.map((item) =>
                    item.id === producto.id  //Si hay coincidencia BUSCANDO en la lista del carrito
                    ? { ...item, cantidad: item.cantidad + 1 } //aumento la cantidad
                    : item //SINO dejo el item como estaba
                );
            }
            else { // si no está, lo agrego con cantidad 1
                return [...carritoAnterior, { ...producto, cantidad: 1 }]; 
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

                    <button onClick={() => agregarAlCarrito(producto)}><img src="/logos/carrito.png" alt="Añadir al carrito" /></button>

                    <ul>
                        {carrito.map((item) => ( //key es un identificador para cada producto

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
