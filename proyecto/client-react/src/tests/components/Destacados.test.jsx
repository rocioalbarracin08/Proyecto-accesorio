import React from 'react';
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Destacados from "../../components/productosDestacados/Destacados";

describe("Destacados Component", () => {
  it("renders the featured products section", () => {
    render(<Destacados />);
    expect(screen.getByText(/productos destacados/i)).toBeInTheDocument();
  });

  it("displays a list of featured products", () => {
    render(<Destacados />);
    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0);
  });
});
