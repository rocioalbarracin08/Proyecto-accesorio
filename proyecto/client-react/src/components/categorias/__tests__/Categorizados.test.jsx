import React from "react";
import { renderWithMockProviders, screen, waitFor,mockUseAuthContext } from "../../../test/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

describe("Categorizados Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra el mensaje de carga inicialmente", () => {
    mockUseAuthContext.mockReturnValue({ userRole: 'cliente', authChecked: true });
    
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
    
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );
    
    expect(screen.getByText("lentes")).toBeInTheDocument();
    expect(screen.getByText("vinchas")).toBeInTheDocument();
    
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
    
    expect(screen.getByText(/no hay categorías disponibles/i)).toBeInTheDocument();
  });

  it("muestra todas las categorías para usuario 'dueño'", async () => {
    mockUseAuthContext.mockReturnValue({ userRole: 'dueño', authChecked: true });
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => [
          { id_category: 1, categoria: "lentes", img_url: "lentes.jpg", activo: 1 },
          { id_category: 2, categoria: "vinchas", img_url: "vinchas.jpg", activo: 0 },
        ],
      })
    );
    
    renderWithMockProviders(<Categorizados />);
    
    await waitFor(() =>
      expect(screen.queryByText(/cargando categorías/i)).not.toBeInTheDocument()
    );
    
    expect(screen.getByText("lentes")).toBeInTheDocument();
    expect(screen.getByText("vinchas")).toBeInTheDocument();
  });
});