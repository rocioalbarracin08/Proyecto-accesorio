import React, { useState, useEffect, use } from "react"
import './grilla.css';

const grilla = () => {
    const [accesorio, setAccesorios] = useState([]);
    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/accesorio")//devuelve un json con la lista de productos
        .then(res => res.json())
        .then(data => { setAccesorios(data); //actualiza el estado de productos con la respuesta del bakend
    })
        .catch(err => console.log("Error cargando productos:", err));                 
    }, []);
    
    return (
        <div className="grid-conteiner"> 
            {accesorio.map((accesorio) =>( 
                <div key={accesorio.id_producto} className="grid-item">
                    <img src={accesorio.imagen_url} alt={producto.name} /> 
                    <h3>{producto.name}</h3> 
                    <p>{producto.precio}</p>
                </div>
            ))}
        </div>
    );
}

export default grilla;