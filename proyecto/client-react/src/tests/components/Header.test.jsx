import "../../../test/setupTests";
import React from "react";
import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "../test-utils";
// Ajusta la ruta siguiente al path real de tu componente Header
// import Header from '../components/Header';

// Si todavía no querés importar el componente real, descomenta el mock de ejemplo:
// const Header = () => <header><h1>Mi App</h1><nav><a href="/">Inicio</a></nav></header>;

describe("Header component (ejemplo)", () => {
  it("renders header title and nav link", () => {
    // Usa el componente real si está disponible:
    // renderWithProviders(<Header />);

    // Si no, usa el mock de ejemplo:
    const HeaderMock = () => (
      <header>
        <h1>Mi App</h1>
        <nav>
          <a href="/">Inicio</a>
        </nav>
      </header>
    );
    renderWithProviders(<HeaderMock />);

    expect(screen.getByText(/mi app/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inicio/i })).toBeInTheDocument();
  });
});
