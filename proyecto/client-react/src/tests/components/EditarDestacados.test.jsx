import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EditarDestacados from "../../components/productosDestacados/EditarDestacados";

describe("EditarDestacados Component", () => {
  it("renders the edit featured products section", () => {
    render(<EditarDestacados />);
    expect(
      screen.getByText(/editar productos destacados/i)
    ).toBeInTheDocument();
  });

  it("displays a form to edit featured products", () => {
    render(<EditarDestacados />);
    expect(screen.getByLabelText(/nombre del producto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar cambios/i })
    ).toBeInTheDocument();
  });
});
