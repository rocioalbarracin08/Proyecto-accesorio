import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GestionProducto from '../components/producto/GestionProducto';

describe('GestionProducto Component', () => {
  it('renders the product management section', () => {
    render(<GestionProducto />);
    expect(screen.getByText(/gestión de productos/i)).toBeInTheDocument();
  });

  it('displays a list of products', () => {
    render(<GestionProducto />);
    expect(screen.getByText(/lista de productos/i)).toBeInTheDocument();
  });
});