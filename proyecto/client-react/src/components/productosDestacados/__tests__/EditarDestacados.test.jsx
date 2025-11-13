import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders para incluir providers
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para interacciones realistas
import EditarDestacados from "../EditarDestacados"; // Importamos el componente

// Mockeamos useAuthContext para controlar el estado de autenticación
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Importamos el mock para configurarlo
import { useAuthContext } from "../../contexts/AuthContext";

// Mockeamos useNavigate para controlar navegación
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mockeamos fetch globalmente para controlar las llamadas a la API
global.fetch = vi.fn();

// Helpers para mocks
const mockProductos = [
  { id_producto: 1, name: "Producto 1", precio: 20.00, imagen_url: "/img1.jpg", stock: 10, destacado: true },
  { id_producto: 2, name: "Producto 2", precio: 30.00, imagen_url: "/img2.jpg", stock: 5, destacado: false },
];

const mockFetchProductos = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ productos: mockProductos }),
});

const mockFetchGuardar = () => global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ mensaje: "Cambios guardados exitosamente" }),
});

describe("EditarDestacados Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: true }); // Usuario logueado y owner por defecto
    mockFetchProductos(); // Mock carga inicial
  });

  it("renderiza la sección de editar productos destacados", async () => {
    renderWithProviders(<EditarDestacados />);
    await screen.findByText("Editar Productos Destacados");
    expect(screen.getByText("Editar Productos Destacados")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar productos...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guardar cambios/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Volver atrás/i })).toBeInTheDocument();
  });

  it("carga y muestra la lista de productos", async () => {
    renderWithProviders(<EditarDestacados />);
    await screen.findByText("Producto 1");
    expect(screen.getByText("Producto 1")).toBeInTheDocument();
    expect(screen.getByText("Producto 2")).toBeInTheDocument();
    expect(screen.getByText("$20.00")).toBeInTheDocument();
    expect(screen.getByText("Stock: 10")).toBeInTheDocument();
  });

  it("filtra productos por búsqueda", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditarDestacados />);
    await screen.findByText("Producto 1");

    const searchInput = screen.getByPlaceholderText("Buscar productos...");
    await user.type(searchInput, "Producto 1");

    expect(screen.getByText("Producto 1")).toBeInTheDocument();
    expect(screen.queryByText("Producto 2")).not.toBeInTheDocument();
  });

  it("Estado destacado de un producto", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditarDestacados />);
    await screen.findByText("Producto 1");

    const checkbox = screen.getAllByRole("checkbox")[0]; // Primer checkbox (Producto 1, destacado: true)
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("guarda cambios exitosamente", async () => {
    mockFetchGuardar();
    const user = userEvent.setup();
    renderWithProviders(<EditarDestacados />);
    await screen.findByText("Producto 1");

    const saveButton = screen.getByRole("button", { name: /Guardar cambios/i });
    await user.click(saveButton);

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/productos/destacados/actualizar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        productos: [
          { id_producto: 1, destacado: 1 },
          { id_producto: 2, destacado: 0 },
        ],
      }),
    });
    expect(screen.getByText("Cambios guardados exitosamente")).toBeInTheDocument();
  });

  it("muestra error al guardar si falla", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Error en servidor" }),
    });
    const user = userEvent.setup();
    renderWithProviders(<EditarDestacados />);
    await screen.findByText("Producto 1");

    const saveButton = screen.getByRole("button", { name: /Guardar cambios/i });
    await user.click(saveButton);

    expect(screen.getByText("Error en servidor")).toBeInTheDocument();
  });

  it("navega atrás al hacer clic en 'Volver Atrás'", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditarDestacados />);
    await screen.findByText("Editar Productos Destacados");

    const backButton = screen.getByRole("button", { name: /Volver atrás/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("no carga productos si no es owner", () => {
    useAuthContext.mockReturnValue({ isLogged: true, isOwner: false });
    renderWithProviders(<EditarDestacados />);
    // No debería cargar productos, pero el componente aún renderiza el título
    expect(screen.getByText("Editar Productos Destacados")).toBeInTheDocument();
    expect(screen.queryByText("Producto 1")).not.toBeInTheDocument();
  });
});