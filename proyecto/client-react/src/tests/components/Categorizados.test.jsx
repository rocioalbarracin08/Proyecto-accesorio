// Este archivo contiene pruebas para el componente Categorizados.
// Categorizados muestra una sección con categorías destacadas.

// La primera prueba verifica que la sección de categorías se renderiza correctamente con el título esperado.
// La segunda prueba asegura que se muestra una lista de categorías con al menos un elemento.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Categorizados from '../../components/categorias/Categorizados';

describe('Categorizados Component', () => {
  it('renders the categories section', () => {
    render(<Categorizados />);
    expect(screen.getByText(/categorías destacadas/i)).toBeInTheDocument();
  });

  it('displays a list of categories', () => {
    render(<Categorizados />);
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });
});