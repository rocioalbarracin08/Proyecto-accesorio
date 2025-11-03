import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Navegacion from '../components/navegacion/Navegacion';

describe('Navegacion Component', () => {
  it('renders the navigation bar', () => {
    render(<Navegacion />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('displays navigation links', () => {
    render(<Navegacion />);
    expect(screen.getByText(/inicio/i)).toBeInTheDocument();
    expect(screen.getByText(/productos/i)).toBeInTheDocument();
    expect(screen.getByText(/contacto/i)).toBeInTheDocument();
  });
});