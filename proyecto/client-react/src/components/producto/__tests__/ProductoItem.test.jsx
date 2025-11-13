import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para interacciones
import ProductoItem from "../ProductoItem"; // Importamos el componente

// Mockeamos contextos
vi.mock("../../contexts/CarritoContext", () => ({
  useCarrito: vi.fn(),
}));
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Importamos mocks
import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";

// Helpers para mocks
const mockProducto = {
  id_producto: 1,
  name: "Producto Test",
  precio: 20.00,
  imagen_url: "/test.jpg",
  stock: 5,
};

const mockPromocion = {
  tipo_descuento: "porcentaje",
  descuento: 0.1, // 10% off
};

const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();
const mockOnUpdateStock = vi.fn();

describe("ProductoItem Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    useCarrito.mockReturnValue({ addItem: vi.fn(), openCarrito: vi.fn() });
    useAuthContext.mockReturnValue({ userRole: "cliente" });
  });

  it("renderiza el item del producto", () => {
    renderWithProviders(<ProductoItem producto={mockProducto} />);
    expect(screen.getByText("Producto Test")).toBeInTheDocument();
    expect(screen.getByText("$20.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agregar al carrito/i })).toBeInTheDocument();
  });

  it("muestra precio con descuento si hay promoción", () => {
    renderWithProviders(<ProductoItem producto={mockProducto} promocion={mockPromocion} />);
    expect(screen.getByText("$20.00")).toHaveStyle("text-decoration: line-through"); // Precio original tachado
    expect(screen.getByText("$18.00")).toBeInTheDocument();
  });

  it("muestra etiqueta de descuento", () => {
    renderWithProviders(<ProductoItem producto={mockProducto} promocion={mockPromocion} />);
    expect(screen.getByText("10% OFF")).toBeInTheDocument();
  });

  it("agrega producto al carrito al hacer clic", async () => {
    const mockAddItem = vi.fn();
    const mockOpenCarrito = vi.fn();
    useCarrito.mockReturnValue({ addItem: mockAddItem, openCarrito: mockOpenCarrito });

    const user = userEvent.setup();
    renderWithProviders(<ProductoItem producto={mockProducto} />);
    await user.click(screen.getByRole("button", { name: /agregar al carrito/i }));

    expect(mockAddItem).toHaveBeenCalledWith({ ...mockProducto, precio: 20.00 });
    expect(mockOpenCarrito).toHaveBeenCalled();
  });

  it("muestra controles para empleados si userRole es 'empleado' y se pasan props", () => {
    useAuthContext.mockReturnValue({ userRole: "empleado" });
    renderWithProviders(<ProductoItem producto={mockProducto} onEdit={mockOnEdit} onDelete={mockOnDelete} onUpdateStock={mockOnUpdateStock} />);
    
    expect(screen.getByText("Stock: 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /desactivar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /actualizar stock/i })).toBeInTheDocument();
  });

  it("no muestra controles para empleados si no es empleado", () => {
    renderWithProviders(<ProductoItem producto={mockProducto} onEdit={mockOnEdit} onDelete={mockOnDelete} onUpdateStock={mockOnUpdateStock} />);
    
    expect(screen.queryByText("Stock: 5")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
  });

  it("llama a onEdit al hacer clic en 'Editar'", async () => {
    useAuthContext.mockReturnValue({ userRole: "empleado" });
    const user = userEvent.setup();
    renderWithProviders(<ProductoItem producto={mockProducto} onEdit={mockOnEdit} onDelete={mockOnDelete} onUpdateStock={mockOnUpdateStock} />);
    
    await user.click(screen.getByRole("button", { name: /editar/i }));
    expect(mockOnEdit).toHaveBeenCalledWith(mockProducto);
  });

  it("llama a onDelete al hacer clic en 'Desactivar'", async () => {
    useAuthContext.mockReturnValue({ userRole: "empleado" });
    const user = userEvent.setup();
    renderWithProviders(<ProductoItem producto={mockProducto} onEdit={mockOnEdit} onDelete={mockOnDelete} onUpdateStock={mockOnUpdateStock} />);
    
    await user.click(screen.getByRole("button", { name: /desactivar/i }));
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it("llama a onUpdateStock al hacer clic en 'Actualizar Stock'", async () => {
    useAuthContext.mockReturnValue({ userRole: "empleado" });
    const user = userEvent.setup();
    renderWithProviders(<ProductoItem producto={mockProducto} onEdit={mockOnEdit} onDelete={mockOnDelete} onUpdateStock={mockOnUpdateStock} />);
    
    await user.click(screen.getByRole("button", { name: /actualizar stock/i }));
    expect(mockOnUpdateStock).toHaveBeenCalledWith(1, 5);
  });

  it("enlaza correctamente al detalle del producto", () => {
    renderWithProviders(<ProductoItem producto={mockProducto} />);
    const link = screen.getByRole("link", { name: /producto test/i });
    expect(link).toHaveAttribute("href", "/producto/1");
  });
});