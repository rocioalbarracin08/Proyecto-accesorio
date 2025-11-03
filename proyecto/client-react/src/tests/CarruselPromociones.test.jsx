// Este archivo contiene pruebas para el componente CarruselPromociones.
// CarruselPromociones muestra un carrusel con promociones destacadas.

// La primera prueba verifica que el carrusel de promociones se renderiza correctamente con el título esperado.
// La segunda prueba asegura que se muestran múltiples elementos de promoción en el carrusel.

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CarruselPromociones from '../components/promociones/CarruselPromociones';

describe('CarruselPromociones Component', () => {
  it('renders the promotions carousel', () => {
    render(<CarruselPromociones />);
    expect(screen.getByText(/promociones destacadas/i)).toBeInTheDocument();
  });

  it('displays multiple promotion items', () => {
    render(<CarruselPromociones />);
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });
});