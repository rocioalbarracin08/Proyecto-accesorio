import "./destacados.css"

export function Destacado(){
    //Mover fotos a productos
    return(
        <section className="seccion-img">
            <img src="/productos/accesorios.jpg" alt="broche" />
            <img src="/productos/vinchaFoto.jpg" alt="foto2" />
            <img src="/productos/brochesRectangulares.jpeg" alt="foto3" />
            <img src="/productos/brochesPerlados.jpg" alt="foto4" />
            <img src="/productos/brocheFlor.jpeg" alt="foto5" />
            <img src="/productos/vinchaConFlor.jpeg" alt="foto6" />
        </section>
    )
    }