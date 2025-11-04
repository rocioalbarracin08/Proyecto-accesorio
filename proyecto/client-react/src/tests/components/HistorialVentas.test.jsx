import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HistorialVentas from '../../components/ventas/HistorialVentas';

describe('HistorialVentas Component', () => {
  it('renders the sales history section', () => {
    render(<HistorialVentas />);
    expect(screen.getByText(/historial de ventas/i)).toBeInTheDocument();
  });

  it('displays a list of sales', () => {
    render(<HistorialVentas />);
    expect(screen.getByText(/venta/i)).toBeInTheDocument();
  });
});