import React from "react";
import { renderWithProviders, screen, waitFor, act } from "../../../test/test-utils.jsx";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { BarraNavegacion as Navegacion } from "../Navegacion";

// Define mocks fuera
const mockUseAuthContext = vi.fn(() => ({
  isLogged: false,
  logout: vi.fn(),
}));
const mockUseCarrito = vi.fn(() => ({
  state: { totalItems: 0, showCarrito: false },
  toggleCarrito: vi.fn(),
  closeCarrito: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

vi.mock("react-icons/fa", () => ({
  FaSearch: ({ onClick, className, ...props }) => <div onClick={onClick} className={className} {...props}>SearchIcon</div>,
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: mockUseAuthContext,
}));

vi.mock("../../contexts/CarritoContext", () => ({
  useCarrito: mockUseCarrito,
}));

vi.mock("../carrito/ComprasCarrito", () => ({
  ComprasCarrito: () => <div>ComprasCarrito Mock</div>,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Navegacion Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthContext.mockReturnValue({
      isLogged: false,
      logout: vi.fn(),
    });
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it("renders the navigation bar", () => {
    renderWithProviders(<Navegacion />);
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("displays navigation links", () => {
    renderWithProviders(<Navegacion />);
    expect(screen.getByText(/inicio/i)).toBeInTheDocument();
    expect(screen.getByText(/tienda/i)).toBeInTheDocument();
    expect(screen.getByText(/\+ info/i)).toBeInTheDocument();
  });

  it("renders the logo", () => {
    renderWithProviders(<Navegacion />);
    const logo = screen.getByAltText("Logo de la tienda");
    expect(logo).toBeInTheDocument();
  });

  it("displays user greeting and profile link when logged in", async () => {
    mockUseAuthContext.mockReturnValue({
      isLogged: true,
      logout: vi.fn(),
    });
    // Mockear fetch para perfil primero, luego categorías
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ nombre: "Juan" }),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]), // Categorías como array vacío
    });

    await act(async () => {
      renderWithProviders(<Navegacion />);
    });
    await waitFor(() => {
      expect(screen.getByText("Hola, Juan!")).toBeInTheDocument();
    });
    expect(screen.getByAltText("Perfil")).toBeInTheDocument();
  });

  it("displays login link when not logged in", () => {
    renderWithProviders(<Navegacion />);
    expect(screen.getByAltText("Iniciar sesión")).toBeInTheDocument();
  });

  it("opens and closes search on icon click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navegacion />);

    const searchIcon = screen.getByLabelText("Abrir búsqueda");
    await act(async () => {
      await user.click(searchIcon);
    });
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Buscar producto o categoría")).toBeInTheDocument();
    });

    expect(screen.getByText("✕")).toBeInTheDocument();

    const closeButton = screen.getByText("✕");
    await act(async () => {
      await user.click(closeButton);
    });
    await waitFor(() => {
      expect(screen.queryByText("✕")).not.toBeInTheDocument();
    });
  });

  it("displays cart count when items are in cart", () => {
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 5, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });

    renderWithProviders(<Navegacion />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("handles logout correctly", async () => {
    const mockLogout = vi.fn();
    mockUseAuthContext.mockReturnValue({
      isLogged: true,
      logout: mockLogout,
    });
    mockFetch.mockResolvedValueOnce({ ok: true });

    const user = userEvent.setup();
    await act(async () => {
      renderWithProviders(<Navegacion />);
    });

    const logoutButton = screen.getByText("Cerrar sesión");
    await act(async () => {
      await user.click(logoutButton);
    });

    expect(mockFetch).toHaveBeenCalledWith("http://localhost:5000/usuarios/logout", {
      method: "POST",
      credentials: "include",
    });
    expect(mockLogout).toHaveBeenCalled();
  });

  it("renders categories in submenu", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id_category: 1, categoria: "Accesorios para cabello" }]),
    });

    await act(async () => {
      renderWithProviders(<Navegacion />);
    });
    await waitFor(() => {
      expect(screen.getByText("Accesorios para cabello")).toBeInTheDocument();
    });
  });
});