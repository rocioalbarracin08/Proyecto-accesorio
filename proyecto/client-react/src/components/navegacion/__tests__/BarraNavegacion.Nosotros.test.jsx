import { describe, it, expect } from "vitest";
import { renderWithMockProviders, screen } from "../test-utils"; // Usa helpers
import { BarraNavegacion } from "./BarraNavegacion";

describe("BarraNavegacion - Submenu + INFO (Nosotros)", () => {
  it("muestra el enlace 'Nosotros' en el submenu", () => {
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica que aparezca en el submenu
    expect(screen.getByRole("link", { name: /Nosotros/i })).toBeInTheDocument();
  });

  it("muestra el enlace 'Preguntas de clientes' en el submenu", () => {
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica que aparezca
    expect(screen.getByRole("link", { name: /Preguntas de clientes/i })).toBeInTheDocument();
  });

  it("el enlace '+ INFO' lleva a '/nosotros'", () => {
    renderWithMockProviders(<BarraNavegacion />);
    
    // Verifica href
    const infoLink = screen.getByRole("link", { name: /\+ INFO/i });
    expect(infoLink).toHaveAttribute("href", "/nosotros");
  });
});