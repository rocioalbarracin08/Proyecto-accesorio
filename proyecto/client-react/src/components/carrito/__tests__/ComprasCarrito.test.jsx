import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders para incluir CarritoProvider
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para interacciones realistas
import { ComprasCarrito } from "../ComprasCarrito"; // Importamos el componente

// Mockeamos useNavigate para controlar navegación
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mockeamos useCarrito para controlar el estado del carrito
vi.mock("../../contexts/CarritoContext", () => ({
  useCarrito: vi.fn(),
}));

// Importamos el mock para configurarlo
import { useCarrito } from "../../contexts/CarritoContext";

describe("ComprasCarrito Component", () => {
  // Limpiamos mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Configuración por defecto: Carrito cerrado y vacío
  beforeEach(() => {
    useCarrito.mockReturnValue({
      state: {
        showCarrito: false,
        items: {},
        totalPrice: 0,
        totalItems: 0,
      },
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
      toggleCarrito: vi.fn(),
    });
  });

  // Test: No renderiza si el carrito no está abierto
  it("no renderiza si showCarrito es false", () => {
    renderWithProviders(<ComprasCarrito />);
    // Verifica que no aparezca nada (el componente retorna null)
    expect(screen.queryByText(/mis compras/i)).not.toBeInTheDocument();
  });

  // Test: Renderiza cuando el carrito está abierto y vacío
  it("renderiza el carrito vacío cuando showCarrito es true", () => {
    useCarrito.mockReturnValue({
      ...useCarrito(),
      state: {
        ...useCarrito().state,
        showCarrito: true,
        items: {},
        totalPrice: 0,
        totalItems: 0,
      },
    });

    renderWithProviders(<ComprasCarrito />);
    expect(screen.getByText(/mis compras/i)).toBeInTheDocument();
    expect(screen.getByText(/no hay productos en el carrito/i)).toBeInTheDocument();
  });

  // Test: Renderiza items en el carrito
  it("renderiza los items en el carrito cuando hay productos", () => {
    const mockItem = {
      producto: {
        id_producto: 1,
        nombre: "Producto 1",
        precio: "10.00",
        imagen: "/img.jpg",
      },
      cantidad: 2,
    };
    useCarrito.mockReturnValue({
      ...useCarrito(),
      state: {
        ...useCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 20.00,
        totalItems: 2,
      },
    });

    renderWithProviders(<ComprasCarrito />);
    expect(screen.getByText("Producto 1")).toBeInTheDocument();
    expect(screen.getByText("$10.00")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Cantidad
    expect(screen.getByText("Subtotal: $20.00")).toBeInTheDocument();
    expect(screen.getByText("Total: $20.00")).toBeInTheDocument();
  });

  // Test: Incrementa cantidad al hacer clic en +
  it("incrementa la cantidad al hacer clic en el botón +", async () => {
    const mockUpdateQuantity = vi.fn();
    const mockItem = {
      producto: {
        id_producto: 1,
        nombre: "Producto 1",
        precio: "10.00",
        imagen: "/img.jpg",
      },
      cantidad: 1,
    };
    useCarrito.mockReturnValue({
      ...useCarrito(),
      state: {
        ...useCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 10.00,
        totalItems: 1,
      },
      updateQuantity: mockUpdateQuantity,
    });

    const user = userEvent.setup();
    renderWithProviders(<ComprasCarrito />);
    
    const incrementButton = screen.getByText("+");
    await user.click(incrementButton);
    
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 2);
  });

  // Test: Decrementa cantidad al hacer clic en -
  it("decrementa la cantidad al hacer clic en el botón -", async () => {
    const mockUpdateQuantity = vi.fn();
    const mockItem = {
      producto: {
        id_producto: 1,
        nombre: "Producto 1",
        precio: "10.00",
        imagen: "/img.jpg",
      },
      cantidad: 2,
    };
    useCarrito.mockReturnValue({
      ...useCarrito(),
      state: {
        ...useCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 20.00,
        totalItems: 2,
      },
      updateQuantity: mockUpdateQuantity,
    });

    const user = userEvent.setup();
    renderWithProviders(<ComprasCarrito />);
    
    const decrementButton = screen.getByText("-");
    await user.click(decrementButton);
    
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1);
  });

  // Test: Elimina item si cantidad llega a 0 al decrementar
  it("elimina el item si la cantidad llega a 1 y se decrementa", async () => {
    const mockRemoveItem = vi.fn();
    const mockItem = {
      producto: {
        id_producto: 1,
        nombre: "Producto 1",
        precio: "10.00",
        imagen: "/img.jpg",
      },
      cantidad: 1,
    };
    useCarrito.mockReturnValue({
      ...useCarrito(),
      state: {
        ...useCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 10.00,
        totalItems: 1,
      },
      removeItem: mockRemoveItem,
    });

    const user = userEvent.setup();
    renderWithProviders(<ComprasCarrito />);
    
    const decrementButton = screen.getByText("-");
    await user.click(decrementButton);
    
    expect(mockRemoveItem).toHaveBeenCalledWith(1);
  });

  // Test: Elimina item al hacer clic en "Eliminar"
  it("elimina el item al hacer clic en el botón 'Eliminar'", async () => {
    const mockRemoveItem = vi.fn();
    const mockItem = {
      producto: {
        id_producto: 1,
        nombre: "Producto 1",
        precio: "10.00",
        imagen: "/img.jpg",
      },
      cantidad: 1,
    };
    useCarrito.mockReturnValue({
      ...useCarrito(),
      state: {
        ...useCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 10.00,
        totalItems: 1,
      },
      removeItem: mockRemoveItem,
    });

    const user = userEvent.setup();
    renderWithProviders(<ComprasCarrito />);
    
    const removeButton = screen.getByTitle("Eliminar producto");
    await user.click(removeButton);
    
    expect(mockRemoveItem).toHaveBeenCalledWith(1);
  });

  // Test: Vacía el carrito al hacer clic en "Vaciar Carrito"
  it("vacía el carrito al hacer clic en 'Vaciar Carrito'", async () => {
    const mockClearCart = vi.fn();
    const mockItem = {
      producto: {
        id_producto: 1,
        nombre: "Producto 1",
        precio: "10.00",
        imagen: "/img.jpg",
      },
      cantidad: 1,
    };
    useCarrito.mockReturnValue({
      ...useCarrito(),
      state: {
        ...useCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 10.00,
        totalItems: 1,
      },
      clearCart: mockClearCart,
    });

    const user = userEvent.setup();
    renderWithProviders(<ComprasCarrito />);
    
    const clearButton = screen.getByText("Vaciar Carrito");
    await user.click(clearButton);
    
    expect(mockClearCart).toHaveBeenCalled();
  });

  // Test: Cierra el carrito al hacer clic en "Cerrar"
  it("cierra el carrito al hacer clic en 'Cerrar'", async () => {
    const mockToggleCarrito = vi.fn();
    useCarrito.mockReturnValue({
      ...useCarrito(),
      state: {
        ...useCarrito().state,
        showCarrito: true,
        items: {},
        totalPrice: 0,
        totalItems: 0,
      },
      toggleCarrito: mockToggleCarrito,
    });

    const user = userEvent.setup();
    renderWithProviders(<ComprasCarrito />);
    
    const closeButton = screen.getByText("Cerrar");
    await user.click(closeButton);
    
    expect(mockToggleCarrito).toHaveBeenCalled();
  });

  // Test: Finaliza compra y navega a /factura
  it("finaliza la compra y navega a /factura", async () => {
    const mockToggleCarrito = vi.fn();
    const mockItem = {
      producto: {
        id_producto: 1,
        nombre: "Producto 1",
        precio: "10.00",
        imagen: "/img.jpg",
      },
      cantidad: 1,
    };
    useCarrito.mockReturnValue({
      ...useCarrito(),
      state: {
        ...useCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 10.00,
        totalItems: 1,
      },
      toggleCarrito: mockToggleCarrito,
    });

    const user = userEvent.setup();
    renderWithProviders(<ComprasCarrito />);
    
    const finalizeButton = screen.getByText("Finalizar Compra");
    await user.click(finalizeButton);
    
    expect(mockToggleCarrito).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/factura");
  });

  // Test: Cierra el carrito al hacer clic en el overlay
  it("cierra el carrito al hacer clic en el overlay", async () => {
    const mockToggleCarrito = vi.fn();
    useCarrito.mockReturnValue({
      ...useCarrito(),
      state: {
        ...useCarrito().state,
        showCarrito: true,
        items: {},
        totalPrice: 0,
        totalItems: 0,
      },
      toggleCarrito: mockToggleCarrito,
    });

    const user = userEvent.setup();
    renderWithProviders(<ComprasCarrito />);
    
    const overlay = screen.getByTestId ? screen.getByTestId("carrito-overlay") : screen.getByClass("carrito-overlay"); // Asume que agregas data-testid si no está
    await user.click(overlay);
    
    expect(mockToggleCarrito).toHaveBeenCalled();
  });
});
