import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Promociones from '../../components/promociones/Promociones';

describe('Promociones Component', () => {
  it('renders the promotions section', () => {
    render(<Promociones />);
    expect(screen.getByText(/promociones disponibles/i)).toBeInTheDocument();
  });

  it('displays a list of promotions', () => {
    render(<Promociones />);
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });
});