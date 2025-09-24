import "./pie.css"

export function PiePagina(){
    return(
    <footer>
        <h4>CONTACTÁNOS</h4>
        <p>accesorios@gmail.com</p>
        <p>1132425262</p>
        <h4>Redes sociales</h4>
        <ul className="iconos">
            <li><a href="instangram.com"><img src="/logos/igIcono.jpeg" alt="" /></a></li>
            <li><a href="tiktok.com"><img src="/logos/tiktokIcono.png" alt="" /></a></li>
            <li><a href="twiter.com"><img src="/logos/twiterIco.png" alt="" /></a></li>
        </ul>
        <p>© 2025 Accesorios | Todos los derechos reservados.</p>
    </footer>
    )
}