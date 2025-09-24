import "./pie.css"

export function PiePagina(){
    return(
    <footer>
        <div className="bloqueDividido">
            
            <div className="contacto">
                <h4>CONTACTÁNOS</h4>
                <p>accesorios@gmail.com</p>
                <p>1132425262</p>
            </div>

            <div className="redes">
                <h4>Redes sociales</h4>
                <ul className="iconos">
                    <li>
                        <a href="instangram.com"><img src="/logos/igIcono.jpeg" alt="" /></a>
                    </li>
                    <li>
                        <a href="tiktok.com"><img src="/logos/tiktokIcono.png" alt="" /></a>
                    </li>
                    <li>
                        <a href="twiter.com"><img src="/logos/twiterIco.png" alt="" /></a>
                    </li>
                </ul>
            </div>
            
            <div className="compañia">
                <h4>Compañia</h4>
                <a href="#">¿Quiénes somos?</a>
                <a href="#">¿Qué hacemos?</a>
            </div>
        </div>
        <p>© 2025 Accesorios | Todos los derechos reservados.</p>
    </footer>
    )
}