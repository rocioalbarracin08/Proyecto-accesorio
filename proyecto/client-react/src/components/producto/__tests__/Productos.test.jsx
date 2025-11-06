import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Productos from '../Productos';

describe('Productos Component', () => {
  it('renders the products section', () => {
    render(<Productos />);
    expect(screen.getByText(/productos disponibles/i)).toBeInTheDocument();
  });

  it('displays a list of products', () => {
    render(<Productos />);
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });
});