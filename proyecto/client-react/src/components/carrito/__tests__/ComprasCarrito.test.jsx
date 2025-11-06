import React from 'react';
import { renderWithProviders, screen } from '../../../test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { ComprasCarrito } from '../ComprasCarrito';
import { renderHook } from '@testing-library/react';  // Para acceder al contexto

// Mockea useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('ComprasCarrito Component', () => {
  it('renders the shopping cart', () => {
    // Usa renderHook para acceder al contexto y abrir el carrito
    const { result } = renderHook(() => {
      const { openCarrito, addItem } = useCarrito();  // Importa useCarrito aquí si es necesario, pero usa el real
      openCarrito();  // Abre el carrito
      addItem({ id: 1, nombre: 'Producto 1', precio: '10.00', imagen: '/img.jpg' });  // Agrega un item
      return { openCarrito, addItem };
    }, { wrapper: ({ children }) => <CarritoProvider>{children}</CarritoProvider> });  // Wrapper manual

    renderWithProviders(<ComprasCarrito />);
    expect(screen.getByText(/mis compras/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /finalizar compra/i })).toBeInTheDocument();
  });

  it('displays a message when the cart is empty', () => {
    // Usa renderHook para abrir el carrito sin items
    const { result } = renderHook(() => {
      const { openCarrito } = useCarrito();
      openCarrito();  // Abre el carrito (vacío por defecto)
      return { openCarrito };
    }, { wrapper: ({ children }) => <CarritoProvider>{children}</CarritoProvider> });

    renderWithProviders(<ComprasCarrito />);
    expect(screen.getByText(/no hay productos en el carrito/i)).toBeInTheDocument();
  });
});