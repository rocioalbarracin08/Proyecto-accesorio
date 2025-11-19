import React from "react";
import { renderWithMockProviders, screen, mockUseAuthContext } from "../../../test/test-utils"; // Cambia a renderWithMockProviders para consistencia con mocks
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event"; // Para interacciones realistas
import GestionProductos from "../GestionProducto"; // Corrige el nombre del componente (exporta como GestionProductos)

// Mockeamos fetch globalmente para controlar todas las llamadas a la API
global.fetch = vi.fn();

// Helpers para reducir repetición en mocks
const mockCategorias = [
  { id_category: 1, categoria: "Lentes" },
  { id_category: 2, categoria: "Aritos" },
];

const mockPerfil = { id_tienda: 5 };

const mockProductoEditar = {
  id_producto: 1,
  name: "Producto Test",
  id_categoria: 1,
  precio: "10.00",
  imagen_url: "/test.jpg",
  id_tienda: 5,
};

const mockFetchCategorias = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => mockCategorias,
});

const mockFetchPerfil = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => mockPerfil,
});

const mockFetchInsertar = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({}),
});

const mockFetchModificar = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({}),
});

const mockFetchError = (error) => global.fetch.mockResolvedValueOnce({
  ok: false,
  json: async () => ({ error }),
});

describe("GestionProducto Component", () => {
  // Limpiamos mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Configuración por defecto antes de cada test
  beforeEach(() => {
    mockUseAuthContext.mockReturnValue({ userRole: "empleado" });
  });

  // Props mockeadas
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  // Test: No renderiza si userRole no es 'empleado'
  it("no renderiza si userRole no es 'empleado'", () => {
    mockUseAuthContext.mockReturnValue({ userRole: "cliente" });

    renderWithMockProviders(<GestionProductos onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.queryByText(/agregar producto/i)).not.toBeInTheDocument();
  });

  // Test: Renderiza el modal para agregar producto
  it("renderiza el modal para agregar producto", async () => {
    mockFetchCategorias();
    mockFetchPerfil();

    renderWithMockProviders(<GestionProductos onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera a que cargue
    await screen.findByText("Agregar Producto");
    expect(screen.getByText("Agregar Producto")).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/imagen url/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  // Test: Renderiza el modal para editar producto
  it("renderiza el modal para editar producto", async () => {
    mockFetchCategorias();
    mockFetchPerfil();

    renderWithMockProviders(<GestionProductos onClose={mockOnClose} onSave={mockOnSave} productoEditar={mockProductoEditar} />);

    // Espera a que cargue
    await screen.findByText("Editar Producto");
    expect(screen.getByText("Editar Producto")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Producto Test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10.00")).toBeInTheDocument();
  });

  // Test: Carga categorías en el select
  it("carga y muestra categorías en el select", async () => {
    mockFetchCategorias();
    mockFetchPerfil();

    renderWithMockProviders(<GestionProductos onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera a que aparezcan las opciones
    await screen.findByText("Lentes");
    expect(screen.getByText("Lentes")).toBeInTheDocument();
    expect(screen.getByText("Aritos")).toBeInTheDocument();
  });

  // Test: Envía formulario para agregar producto exitosamente
  it("envía formulario para agregar producto exitosamente", async () => {
    mockFetchCategorias();
    mockFetchPerfil();
    mockFetchInsertar();

    const user = userEvent.setup();
    renderWithMockProviders(<GestionProductos onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera y llena el form
    await screen.findByLabelText(/nombre/i);
    await user.type(screen.getByLabelText(/nombre/i), "Nuevo Producto");
    await user.selectOptions(screen.getByLabelText(/categoría/i), "1");
    await user.type(screen.getByLabelText(/precio/i), "15.00");
    await user.type(screen.getByLabelText(/imagen url/i), "/nueva.jpg");

    // Envía
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    // Verifica fetch
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/productos/insertar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: "Nuevo Producto",
        id_categoria: "1",
        precio: "15.00",
        imagen_url: "/nueva.jpg",
        id_tienda: 5, // Desde perfil
      }),
    });
    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test: Envía formulario para editar producto exitosamente
  it("envía formulario para editar producto exitosamente", async () => {
    mockFetchCategorias();
    mockFetchPerfil();
    mockFetchModificar();

    const user = userEvent.setup();
    renderWithMockProviders(<GestionProductos onClose={mockOnClose} onSave={mockOnSave} productoEditar={mockProductoEditar} />);

    // Espera y edita
    await screen.findByDisplayValue("Producto Test");
    const nombreInput = screen.getByDisplayValue("Producto Test");
    await user.clear(nombreInput);
    await user.type(nombreInput, "Producto Editado");

    // Envía
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    // Verifica fetch
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/productos/modificar/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: "Producto Editado",
        id_categoria: "1",
        precio: "10.00",
        imagen_url: "/test.jpg",
        id_tienda: 5,
      }),
    });
    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test: Maneja error en envío
  it("maneja error en envío del formulario", async () => {
    mockFetchCategorias();
    mockFetchPerfil();
    mockFetchError("Producto ya existe");

    // Mock alert
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const user = userEvent.setup();
    renderWithMockProviders(<GestionProductos onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera y llena mínimo
    await screen.findByLabelText(/nombre/i);
    await user.type(screen.getByLabelText(/nombre/i), "Producto");
    await user.selectOptions(screen.getByLabelText(/categoría/i), "1");
    await user.type(screen.getByLabelText(/precio/i), "10.00");

    // Envía
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    // Verifica alerta
    expect(mockAlert).toHaveBeenCalledWith("Error al guardar producto: Producto ya existe");
    mockAlert.mockRestore();
  });

  // Test: Cierra modal al hacer clic en overlay
  it("cierra modal al hacer clic en overlay", async () => {
    mockFetchCategorias();
    mockFetchPerfil();

    const user = userEvent.setup();
    renderWithMockProviders(<GestionProductos onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera y clic en overlay
    await screen.findByText("Agregar Producto");
    const overlay = document.querySelector(".modal-overlay");
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test: Cierra modal al hacer clic en "Cancelar"
  it("cierra modal al hacer clic en 'Cancelar'", async () => {
    mockFetchCategorias();
    mockFetchPerfil();

    const user = userEvent.setup();
    renderWithMockProviders(<GestionProductos onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera y clic en cancelar
    await screen.findByRole("button", { name: /cancelar/i });
    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});