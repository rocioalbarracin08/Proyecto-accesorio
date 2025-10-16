
import React, { useState } from "react";
import "./nosotros.css";

export default function Nosotros() {
	// Carrusel
	const images = [
		"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fd3%2F27%2Ff0%2Fd327f00412bea9a5755bf145a648fbf4.jpg&f=1&nofb=1&ipt=c53fe0c859894f2ac81a9b6335e98a68e79a5b48b250a47453258628e73602e0",
		"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.abc.com.py%2Fresizer%2FjZBG-qqWlwO290Uk0RTWNAJ--R4%3D%2Ffit-in%2F770x495%2Fsmart%2Ffilters%3Aformat(webp)%2Fcloudfront-us-east-1.images.arcpublishing.com%2Fabccolor%2FLVOLF2IC3VAVRDA4W77IVAO7TI.JPG&f=1&nofb=1&ipt=9b4897bd844459d055ad9374600b58fd34f19f50bbe31a3082847625876a5d7e",
		"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F27%2Fef%2F96%2F27ef96bc072c386d371f3f796eb65b55.jpg&f=1&nofb=1&ipt=4c20b94c6ca135d396d1eb1a3a1c3a035cf7a5158de8f1ca3401b64e375939ab"
	];

	const [current, setCurrent] = useState(0);
	const nextSlide = () => setCurrent((current + 1) % images.length);
	const prevSlide = () => setCurrent((current - 1 + images.length) % images.length);

	// Preguntas desplegables
	const [open, setOpen] = useState(null);
	const preguntas = [
		{
			pregunta: "¿Quiénes somos?",
			respuesta: "Somos una empresa dedicada a la venta de accesorios únicos, comprometidos con la calidad y la satisfacción de nuestros clientes."
		},
		{
			pregunta: "¿Qué hacemos?",
			respuesta: "Ofrecemos una amplia variedad de productos, desde broches hasta bolsos, diseñados para resaltar tu estilo y personalidad."
		},
		{
			pregunta: "¿Dónde estamos?",
			respuesta: "Nos encontramos en [ubicación], pero realizamos envíos a todo el país."
		}
	];

	const toggle = (idx) => setOpen(open === idx ? null : idx);

	return (
		<div className="nosotros-container">
			<h2>Nosotros</h2>
			<div className="carrusel">
				<button className="carrusel-btn" onClick={prevSlide}>&lt;</button>
				<img src={images[current]} alt={`slide-${current}`} className="carrusel-img" />
				<button className="carrusel-btn" onClick={nextSlide}>&gt;</button>
			</div>
			<div className="preguntas">
				{preguntas.map((item, idx) => (
					<div key={idx} className="pregunta-item">
						<button className="pregunta-btn" onClick={() => toggle(idx)}>
							{item.pregunta}
						</button>
						{open === idx && (
							<div className="respuesta">
								{item.respuesta}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
