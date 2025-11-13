import React from "react";
import { renderWithProviders, screen } from "../../../test/test-utils"; // Usamos renderWithProviders para incluir providers como AuthProvider
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Usamos userEvent para interacciones más realistas (en lugar de fireEvent)
import DashboardEmpleado from "../DashboardEmpleado"; // Importamos el componente

import { useAuthContext } from "../../contexts/AuthContext";

// Mockeamos useAuthContext para controlar el estado de autenticación
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Mockeamos useNavigate para controlar navegación
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mockeamos los componentes hijos para evitar renders complejos
vi.mock("../producto/Productos", () => ({
  Productos: () => <div data-testid="productos-component">Componente Productos</div>,
}));
vi.mock("../ventas/RegistrarVenta", () => ({
  RegistrarVenta: () => <div data-testid="registrar-venta-component">Componente RegistrarVenta</div>,
}));
vi.mock("../ventas/HistorialVentas", () => ({
  HistorialVentas: () => <div data-testid="historial-ventas-component">Componente HistorialVentas</div>,
}));

// Mockeamos fetch globalmente para controlar las llamadas a la API
global.fetch = vi.fn();

describe("DashboardEmpleado Component", () => {
  // Limpiamos mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Configuración por defecto antes de cada test
  beforeEach(() => {
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
      logout: vi.fn(),
    });
    // Mock por defecto para fetches (perfil y tienda)
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}), // Respuesta vacía por defecto
    });
  });

  // Test: Renderiza correctamente el panel principal
  it("renderiza correctamente el panel principal", async () => {
    // Mock fetch para perfil y tienda
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id_tienda: 1 }), // Perfil con tienda
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id_tienda: 1, nombre: "Tienda Ejemplo" }]), // Tienda
      });

    renderWithProviders(<DashboardEmpleado />);
    
    // Espera que cargue el perfil y tienda
    await screen.findByText(/panel de empleado/i);
    
    // Verifica el título principal
    expect(screen.getByText(/panel de empleado/i)).toBeInTheDocument();
    
    // Verifica la tienda (debe mostrar "Tienda Ejemplo" después del fetch)
    expect(screen.getByText(/tienda: Tienda Ejemplo/i)).toBeInTheDocument();
    
    // Verifica los botones de navegación
    expect(screen.getByRole("button", { name: /gestionar productos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /registrar venta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver mis ventas/i })).toBeInTheDocument();
    
    // Verifica el botón de cerrar sesión
    expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  // Test: Muestra la sección de productos por defecto
  it("muestra la sección de productos por defecto", async () => {
    // Mock fetch para perfil y tienda
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id_tienda: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id_tienda: 1, nombre: "Tienda Ejemplo" }]),
      });

    renderWithProviders(<DashboardEmpleado />);
    
    // Espera que cargue y verifica la sección por defecto
    await screen.findByTestId("productos-component");
    expect(screen.getByTestId("productos-component")).toBeInTheDocument();
  });

  // Test: Cambia a la sección de ventas al hacer clic
  it("cambia a la sección de ventas al hacer clic", async () => {
    // Mock fetch
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id_tienda: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id_tienda: 1, nombre: "Tienda Ejemplo" }]),
      });

    const user = userEvent.setup();
    renderWithProviders(<DashboardEmpleado />);
    
    // Espera que cargue
    await screen.findByTestId("productos-component");
    
    // Haz clic en "Registrar Venta"
    const ventasButton = screen.getByRole("button", { name: /registrar venta/i });
    await user.click(ventasButton);
    
    // Verifica que cambie a la sección de ventas
    expect(screen.getByTestId("registrar-venta-component")).toBeInTheDocument();
    expect(screen.queryByTestId("productos-component")).not.toBeInTheDocument();
  });

  // Test: Cambia a la sección de historial al hacer clic
  it("cambia a la sección de historial al hacer clic", async () => {
    // Mock fetch
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id_tienda: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id_tienda: 1, nombre: "Tienda Ejemplo" }]),
      });

    const user = userEvent.setup();
    renderWithProviders(<DashboardEmpleado />);
    
    // Espera que cargue
    await screen.findByTestId("productos-component");
    
    // Haz clic en "Ver Mis Ventas"
    const historialButton = screen.getByRole("button", { name: /ver mis ventas/i });
    await user.click(historialButton);
    
    // Verifica que cambie a la sección de historial
    expect(screen.getByTestId("historial-ventas-component")).toBeInTheDocument();
    expect(screen.queryByTestId("productos-component")).not.toBeInTheDocument();
  });

  // Test: Llama a logout al hacer clic en cerrar sesión
  it("llama a logout al hacer clic en cerrar sesión", async () => {
    const mockLogout = vi.fn();
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
      logout: mockLogout,
    });
    
    // Mock fetch para perfil, tienda y logout
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id_tienda: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id_tienda: 1, nombre: "Tienda Ejemplo" }]),
      })
      .mockResolvedValueOnce({
        ok: true, // Logout
      });

    const user = userEvent.setup();
    renderWithProviders(<DashboardEmpleado />);
    
    // Espera que cargue
    await screen.findByRole("button", { name: /cerrar sesión/i });
    
    // Haz clic en "Cerrar Sesión"
    const logoutButton = screen.getByRole("button", { name: /cerrar sesión/i });
    await user.click(logoutButton);
    
    // Verifica que fetch haya sido llamado para logout
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/usuarios/logout", {
      method: "POST",
      credentials: "include",
    });
    // Verifica que logout del contexto haya sido llamado
    expect(mockLogout).toHaveBeenCalled();
    // Verifica navegación a /login
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // Test adicional: Maneja error en fetch de perfil
  it("maneja error en fetch de perfil", async () => {
    // Mock fetch para perfil fallido
    global.fetch.mockRejectedValueOnce(new Error("Error de red"));
    
    renderWithProviders(<DashboardEmpleado />);
    
    // Espera que renderice (sin perfil, pero aún muestra el panel)
    await screen.findByText(/panel de empleado/i);
    
    // Verifica que no muestre tienda específica (usa "Asignada" por defecto)
    expect(screen.getByText(/tienda: asignada/i)).toBeInTheDocument();
  });
});