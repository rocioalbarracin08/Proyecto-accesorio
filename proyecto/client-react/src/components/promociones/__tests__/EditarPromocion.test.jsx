import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EditarPromocion from "../EditarPromocion";

describe("EditarPromocion Component", () => {
  it("renders the edit promotion form", () => {
    render(<EditarPromocion />);
    expect(screen.getByText(/editar promoción/i)).toBeInTheDocument();
  });

  it("displays input fields for editing promotion details", () => {
    render(<EditarPromocion />);
    expect(
      screen.getByLabelText(/nombre de la promoción/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/descuento/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar cambios/i })
    ).toBeInTheDocument();
  });
});
