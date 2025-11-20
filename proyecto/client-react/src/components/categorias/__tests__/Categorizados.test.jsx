import React from "react";
import { renderWithMockProviders, screen, waitFor, mockUseAuthContext } from "../../../test/test-utils";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Categorizados } from "../Categorizados";

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
// Mock de useAuthContext (agregado para sobrescribir el hook)
vi.mock("../../../contexts/AuthContext", () => ({
  useAuthContext: mockUseAuthContext,
}));

describe("Categorizados Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();  // Limpia mocks antes de cada test
  });

  afterEach(() => {
    vi.restoreAllMocks();  // Restaura mocks después de cada test
  });

  it("muestra el mensaje de carga inicialmente", () => {
    mockUseAuthContext.mockReturnValue({ userRole: 'cliente', authChecked: true });
    
    // Mock fetch para simular carga inicial
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => [],
      })
    );
    
    renderWithMockProviders(<Categorizados />);
    expect(screen.getByText(/cargando categorías/i)).toBeInTheDocument();
  });

  it("renderiza la lista de categorías después de cargar", async () => {
    mockUseAuthContext.mockReturnValue({ userRole: 'cliente', authChecked: true });
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => [
          { id_category: 1, categoria: "lentes", img_url: "lentes.jpg", activo: 1 },
          { id_category: 2, categoria: "vinchas", img_url: "vinchas.jpg", activo: 1 },
        ],
      })
    );
    
    renderWithMockProviders(<Categorizados />);
    
    // Espera a que termine la carga
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );
    
    expect(screen.getByText("lentes")).toBeInTheDocument();
    expect(screen.getByText("vinchas")).toBeInTheDocument();
    
    // Verifica botones de navegación (usa aria-label del componente)
    const buttons = screen.getAllByRole("button", { name: /ver productos de/i });
    expect(buttons.length).toBe(2);
  });

  it("muestra mensaje si no hay categorías disponibles", async () => {
    mockUseAuthContext.mockReturnValue({ userRole: 'cliente', authChecked: true });
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => [],
      })
    );
    
    renderWithMockProviders(<Categorizados />);
    
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );
    
    expect(screen.getByText(/no hay categorías disponibles/i)).toBeInTheDocument();
  });

  it("navega correctamente al hacer click en una categoría", async () => {
    mockUseAuthContext.mockReturnValue({ userRole: 'cliente', authChecked: true });
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => [
          { id_category: 1, categoria: "lentes", img_url: "lentes.jpg", activo: 1 },
        ],
      })
    );
    
    const user = userEvent.setup();
    renderWithMockProviders(<Categorizados />);
    
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );
    
    const button = screen.getByRole("button", { name: /ver productos de lentes/i });
    await user.click(button);
    
    expect(mockNavigate).toHaveBeenCalledWith("/productos/1");
  });

  it("maneja error de conexión al cargar categorías", async () => {
    mockUseAuthContext.mockReturnValue({ userRole: 'cliente', authChecked: true });
    
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));
    
    renderWithMockProviders(<Categorizados />);
    
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );
    
    // El componente muestra "No hay categorías disponibles." en caso de error
    expect(screen.getByText(/no hay categorías disponibles/i)).toBeInTheDocument();
  });

  it("muestra todas las categorías para usuario 'dueño'", async () => {
    mockUseAuthContext.mockReturnValue({ userRole: 'dueño', authChecked: true });
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => [
          { id_category: 1, categoria: "lentes", img_url: "lentes.jpg", activo: 1 },
          { id_category: 2, categoria: "vinchas", img_url: "vinchas.jpg", activo: 0 },  // Inactiva
        ],
      })
    );
    
    renderWithMockProviders(<Categorizados />);
    
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );
    
    // Para 'dueño', muestra todas (activas e inactivas)
    expect(screen.getByText("lentes")).toBeInTheDocument();
    expect(screen.getByText("vinchas")).toBeInTheDocument();
    expect(screen.getByText("Activa")).toBeInTheDocument();  // Estado de la primera
    expect(screen.getByText("Inactiva")).toBeInTheDocument();  // Estado de la segunda
  });
});