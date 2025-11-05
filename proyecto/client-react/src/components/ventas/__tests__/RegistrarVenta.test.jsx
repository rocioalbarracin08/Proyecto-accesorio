import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RegistrarVenta from "../RegistrarVenta";

describe("RegistrarVenta Component", () => {
  it("renders the sales registration form", () => {
    render(<RegistrarVenta />);
    expect(screen.getByText(/registrar venta/i)).toBeInTheDocument();
  });

  it("displays input fields for sale details", () => {
    render(<RegistrarVenta />);
    expect(screen.getByLabelText(/producto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cantidad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/precio/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar venta/i })
    ).toBeInTheDocument();
  });
});
