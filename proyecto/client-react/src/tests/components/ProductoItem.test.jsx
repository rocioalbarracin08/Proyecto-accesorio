import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductoItem from '../../components/producto/ProductoItem';

describe('ProductoItem Component', () => {
  it('renders a product item', () => {
    render(<ProductoItem />);
    expect(screen.getByText(/producto/i)).toBeInTheDocument();
  });

  it('displays product name and price', () => {
    render(<ProductoItem />);
    expect(screen.getByText(/nombre del producto/i)).toBeInTheDocument();
    expect(screen.getByText(/precio/i)).toBeInTheDocument();
  });
});