import { Link } from "react-router-dom";
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
                <div className="iconos">
                    
                        <a href="https://www.instagram.com/"><img src="/logos/igIcono.jpeg" alt="" /></a>
                
                    
                        <a href="https://www.tiktok.com/"><img src="/logos/tiktokIcono.png" alt="" /></a>
                    
                        <a href="twiter.com"><img src="/logos/twiterIco.png" alt="" /></a>
                    
                </div>
            </div>
            
            <div className="compañia">
                <h4>Compañia</h4>
                <Link to="/nosotros" className="a-company">¿Quiénes somos?</Link>
                <Link to="/nosotros/preguntas" className="a-company">¿Cómo trabajamos?</Link>
            </div>

        </div>
        <h5 className="derechos">© 2025 Accesorios | Todos los derechos reservados</h5>
    </footer>
    )
}