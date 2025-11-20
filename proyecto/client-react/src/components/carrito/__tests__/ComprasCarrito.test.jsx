import React from "react";
import { renderWithMockProviders, screen, mockUseCarrito } from "../../../test/test-utils"; // Cambié a renderWithMockProviders para usar los providers mockeados
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para interacciones realistas
import { ComprasCarrito } from "../ComprasCarrito";

// Mockeamos useNavigate para controlar navegación
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock global del hook useCarrito (top-level, para que el componente use el mock)
vi.mock("../../../contexts/CarritoContext", () => ({
  useCarrito: mockUseCarrito,  // Usa el mock de test-utils
}));

describe("ComprasCarrito Component", () => {
  // Limpiamos mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Configuración por defecto: Carrito cerrado y vacío
  beforeEach(() => {
    mockUseCarrito.mockReturnValue({
      state: {
        showCarrito: false,
        items: {},
        totalPrice: 0,
        totalItems: 0,
      },
      updateQuantity: vi.fn(),
      updateItem: vi.fn(), // Agregado: el componente usa updateItem para cambiar el color
      removeItem: vi.fn(),
      clearCart: vi.fn(),
      toggleCarrito: vi.fn(),
    });
  });

  // Test: No renderiza si el carrito no está abierto
  it("no renderiza si showCarrito es false", () => {
    renderWithMockProviders(<ComprasCarrito />);
    // Verifica que no aparezca nada (el componente retorna null)
    expect(screen.queryByText(/Mis compras/i)).not.toBeInTheDocument();
  });

  // Test: Renderiza cuando el carrito está abierto y vacío
  it("renderiza el carrito vacío cuando showCarrito es true", () => {
    mockUseCarrito.mockReturnValue({
      ...mockUseCarrito(),
      state: {
        ...mockUseCarrito().state,
        showCarrito: true,
        items: {},
        totalPrice: 0,
        totalItems: 0,
      },
    });

    renderWithMockProviders(<ComprasCarrito />);
    expect(screen.getByText(/Mis compras/i)).toBeInTheDocument();
    expect(screen.getByText(/no hay productos en el carrito/i)).toBeInTheDocument();
  });

  // Test: Renderiza items en el carrito
  it("renderiza los items en el carrito cuando hay productos", () => {
    const mockItem = {
      producto: {
        id_producto: 1,
        nombre: "Producto 1",
        precio: "10.0",
        imagen: "/img.jpg",
      },
      cantidad: 2,
    };
    mockUseCarrito.mockReturnValue({
      ...mockUseCarrito(),
      state: {
        ...mockUseCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 20.0,  // Asegúrate de que sea 20.00 (número)
        totalItems: 2,
      },
    });

    renderWithMockProviders(<ComprasCarrito />);
    expect(screen.getByText("Producto 1")).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.includes("10"))).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    // Funciones flexibles para subtotal y total
    expect(screen.getByText((content, element) => content.includes("Subtotal: $20"))).toBeInTheDocument();
    // Para total: busca "$20.00" directamente, ya que está en su propio elemento
    expect(screen.getByText("$20.0")).toBeInTheDocument();  // EL TOTAL ESTA EN UN STRONG APARTE, solo buscamos un elemento DOM ahora
  });

  // Test: Incrementa cantidad al hacer clic en +
  it("incrementa la cantidad al hacer clic en el botón +", async () => {
    const mockUpdateQuantity = vi.fn();
    const mockItem = {
      producto: {
        id_producto: 1,
        nombre: "Producto 1",
        precio: "10.0",
        imagen: "/img.jpg",
      },
      cantidad: 1,
    };
    mockUseCarrito.mockReturnValue({
      ...mockUseCarrito(),
      state: {
        ...mockUseCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 10.0,
        totalItems: 1,
      },
      updateQuantity: mockUpdateQuantity,
    });

    const user = userEvent.setup();
    renderWithMockProviders(<ComprasCarrito />);
    
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
        precio: "10.0",
        imagen: "/img.jpg",
      },
      cantidad: 2,
    };
    mockUseCarrito.mockReturnValue({
      ...mockUseCarrito(),
      state: {
        ...mockUseCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 20.0,
        totalItems: 2,
      },
      updateQuantity: mockUpdateQuantity,
    });

    const user = userEvent.setup();
    renderWithMockProviders(<ComprasCarrito />);
    
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
        precio: "10.0",
        imagen: "/img.jpg",
      },
      cantidad: 1,
    };
    mockUseCarrito.mockReturnValue({
      ...mockUseCarrito(),
      state: {
        ...mockUseCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 10.0,
        totalItems: 1,
      },
      removeItem: mockRemoveItem,
    });

    const user = userEvent.setup();
    renderWithMockProviders(<ComprasCarrito />);
    
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
        precio: "10.0",
        imagen: "/img.jpg",
      },
      cantidad: 1,
    };
    mockUseCarrito.mockReturnValue({
      ...mockUseCarrito(),
      state: {
        ...mockUseCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 10.0,
        totalItems: 1,
      },
      removeItem: mockRemoveItem,
    });

    const user = userEvent.setup();
    renderWithMockProviders(<ComprasCarrito />);
    
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
        precio: "10.0",
        imagen: "/img.jpg",
      },
      cantidad: 1,
    };
    mockUseCarrito.mockReturnValue({
      ...mockUseCarrito(),
      state: {
        ...mockUseCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 10.0,
        totalItems: 1,
      },
      clearCart: mockClearCart,
    });

    const user = userEvent.setup();
    renderWithMockProviders(<ComprasCarrito />);
    
    const clearButton = screen.getByText("Vaciar Carrito");
    await user.click(clearButton);
    
    expect(mockClearCart).toHaveBeenCalled();
  });

  // Test: Cierra el carrito al hacer clic en "Cerrar" (funciona porque puse el boton fuera del condicional que busca si hay productos en el carrito)
  it("cierra el carrito al hacer clic en 'Cerrar'", async () => {
    const mockToggleCarrito = vi.fn();
    mockUseCarrito.mockReturnValue({
      ...mockUseCarrito(),
      state: {
        ...mockUseCarrito().state,
        showCarrito: true,
        items: {},
        totalPrice: 0,
        totalItems: 0,
      },
      toggleCarrito: mockToggleCarrito,
    });

    const user = userEvent.setup();
    renderWithMockProviders(<ComprasCarrito />);
    
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
        precio: "10.0",
        imagen: "/img.jpg",
      },
      cantidad: 1,
    };
    mockUseCarrito.mockReturnValue({
      ...mockUseCarrito(),
      state: {
        ...mockUseCarrito().state,
        showCarrito: true,
        items: { 1: mockItem },
        totalPrice: 10.0,
        totalItems: 1,
      },
      toggleCarrito: mockToggleCarrito,
    });

    const user = userEvent.setup();
    renderWithMockProviders(<ComprasCarrito />);
    
    const finalizeButton = screen.getByText("Finalizar Compra");
    await user.click(finalizeButton);
    
    expect(mockToggleCarrito).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/factura");
  });

  // Test: Cierra el carrito al hacer clic en el overlay
  it("cierra el carrito al hacer clic en el overlay", async () => {
    const mockToggleCarrito = vi.fn();
    mockUseCarrito.mockReturnValue({
      ...mockUseCarrito(),
      state: {
        ...mockUseCarrito().state,
        showCarrito: true,
        items: {},
        totalPrice: 0,
        totalItems: 0,
      },
      toggleCarrito: mockToggleCarrito,
    });

    const user = userEvent.setup();
    renderWithMockProviders(<ComprasCarrito />);
    
    // Para que esto funcione, agrego data-testid="carrito-overlay" al <section> en ComprasCarrito
    const overlay = screen.getByTestId("carrito-overlay");
    await user.click(overlay);
    
    expect(mockToggleCarrito).toHaveBeenCalled();
  });
});