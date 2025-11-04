import React from 'react';
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Destacado from "../../components/productosDestacados/Destacado";

describe("Destacado Component", () => {
  it("renders a featured product", () => {
    render(<Destacado />);
    expect(screen.getByText(/producto destacado/i)).toBeInTheDocument();
  });

  it("displays product name and description", () => {
    render(<Destacado />);
    expect(screen.getByText(/nombre del producto/i)).toBeInTheDocument();
    expect(screen.getByText(/descripción/i)).toBeInTheDocument();
  });
});
