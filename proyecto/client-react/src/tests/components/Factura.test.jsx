import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Factura from "../../components/factura/factura";

describe("Factura Component", () => {
  it("renders the invoice section", () => {
    render(<Factura />);
    expect(screen.getByText(/factura/i)).toBeInTheDocument();
  });

  it("displays the correct invoice details", () => {
    render(<Factura />);
    expect(screen.getByText(/total/i)).toBeInTheDocument();
    expect(screen.getByText(/productos/i)).toBeInTheDocument();
  });
});
