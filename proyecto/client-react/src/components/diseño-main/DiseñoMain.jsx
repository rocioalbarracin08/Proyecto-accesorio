import React from "react";
import "./diseño-main.css";

export default function DiseñoMain() {
  const items = [
    {
      img: "/iconos/iconoCompraSegura.png",
      texto: "Comprá fácil y rápido",
    },
    {
      img: "/iconos/iconoEnvios.png",
      texto: "Envíos a todo el país",
    },
    {
      img: "/iconos/iconoDatosSeguros.png",
      texto: "Pagá como quieras",
    },
  ];

  return (
    <section className="compras-section">
      <h2>Para tus compras</h2>
      <div className="compras-grid">
        {items.map((item, i) => (
          <div key={i} className="compras-item">
            <img src={item.img} alt={item.texto} />
            <p>{item.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
