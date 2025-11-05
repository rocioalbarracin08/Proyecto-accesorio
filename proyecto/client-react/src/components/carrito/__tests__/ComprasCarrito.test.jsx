// Este archivo contiene pruebas para el componente ComprasCarrito.
// ComprasCarrito muestra el carrito de compras de un usuario.

// La primera prueba verifica que el carrito de compras se renderiza correctamente con el título y el botón de finalizar compra.
// La segunda prueba asegura que se muestra un mensaje indicando que el carrito está vacío cuando no hay productos.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ComprasCarrito from '../ComprasCarrito';

describe('ComprasCarrito Component', () => {
  it('renders the shopping cart', () => {
    render(<ComprasCarrito />);
    expect(screen.getByText(/carrito de compras/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /finalizar compra/i })).toBeInTheDocument();
  });

  it('displays a message when the cart is empty', () => {
    render(<ComprasCarrito />);
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
  });
});