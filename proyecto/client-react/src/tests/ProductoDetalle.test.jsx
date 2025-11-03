import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductoDetalle from '../components/producto/ProductoDetalle';

describe('ProductoDetalle Component', () => {
  it('renders the product detail section', () => {
    render(<ProductoDetalle />);
    expect(screen.getByText(/detalle del producto/i)).toBeInTheDocument();
  });

  it('displays product information', () => {
    render(<ProductoDetalle />);
    expect(screen.getByText(/nombre del producto/i)).toBeInTheDocument();
    expect(screen.getByText(/precio/i)).toBeInTheDocument();
  });
});