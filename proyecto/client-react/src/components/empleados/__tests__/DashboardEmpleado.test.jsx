import React from "react";
import { renderWithMockProviders, screen, mockUseAuthContext, mockUsePromociones, mockUseCarrito } from "../../../test/test-utils";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import DashboardEmpleado from "../DashboardEmpleado";

// Mockeamos useNavigate y useLocation
const mockNavigate = vi.fn();
const mockLocation = { search: '' };
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

vi.mock("../../../contexts/AuthContext", () => ({ //Hay algo raro aca, la ruta cambia y funciona (si pongo la del componente no anda)
  useAuthContext: mockUseAuthContext,
}));

vi.mock("../../../contexts/PromocionesContext", () => ({
  usePromociones: mockUsePromociones,
}));

vi.mock("../../../contexts/CarritoContext", () => ({
  useCarrito: mockUseCarrito,
}));

// Mockeamos los componentes hijos
vi.mock("../../producto/Productos", () => ({ //la ubicacion para mockear el componente que se necesita (fijandonose en el componente original)
  Productos: ({ includeInactiveForEmployee, ...props }) => <div data-testid="productos-component" {...props}>Componente Productos</div>,
}));
vi.mock("../../ventas/RegistrarVenta", () => ({
  default: () => <div data-testid="registrar-venta-component">Componente RegistrarVenta</div>,
}));
vi.mock("../../ventas/HistorialVentas", () => ({
  default: () => <div data-testid="historial-ventas-component">Componente HistorialVentas</div>,
}));

// Mockeamos fetch globalmente
vi.stubGlobal('fetch', vi.fn());

describe("DashboardEmpleado Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockUseAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
      logout: vi.fn(),
    });
    mockUsePromociones.mockReturnValue({
      promociones: [],
      loading: false,
      error: null,
    });
    mockUseCarrito.mockReturnValue({
      state: { totalItems: 0, showCarrito: false },
      toggleCarrito: vi.fn(),
      closeCarrito: vi.fn(),
    });
  });

  it("renderiza correctamente el panel principal", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id_tienda: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id_tienda: 1, nombre: "Tienda Ejemplo" }]),
      });

    renderWithMockProviders(<DashboardEmpleado />);
    
    await screen.findByText(/Panel de empleado/i);
    
    expect(screen.getByText(/Panel de empleado/i)).toBeInTheDocument();
    expect(screen.getByText(/Tienda: Tienda Ejemplo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gestionar productos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registrar venta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver mis ventas/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cerrar sesión/i })).toBeInTheDocument();
  });

  it("muestra la sección de productos por defecto", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id_tienda: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id_tienda: 1, nombre: "Tienda Ejemplo" }]),
      });

    renderWithMockProviders(<DashboardEmpleado />);
    
    await screen.findByTestId("productos-component"); //data-testid agregado en el componente main
    expect(screen.getByTestId("productos-component")).toBeInTheDocument();
  });

  it("cambia a la sección de ventas al hacer clic", async () => {
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
    renderWithMockProviders(<DashboardEmpleado />);
    
    await screen.findByTestId("productos-component");
    
    const ventasButton = screen.getByRole("button", { name: /Registrar venta/i });
    await user.click(ventasButton);
    
    expect(screen.getByTestId("registrar-venta-component")).toBeInTheDocument();
    expect(screen.queryByTestId("productos-component")).not.toBeInTheDocument();
  });

  it("cambia a la sección de historial al hacer clic", async () => {
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
    renderWithMockProviders(<DashboardEmpleado />);
    
    await screen.findByTestId("productos-component");
    
    const historialButton = screen.getByRole("button", { name: /Ver mis ventas/i });
    await user.click(historialButton);
    
    expect(screen.getByTestId("historial-ventas-component")).toBeInTheDocument();
    expect(screen.queryByTestId("productos-component")).not.toBeInTheDocument();
  });

  it("llama a logout al hacer clic en cerrar sesión", async () => {
    const mockLogout = vi.fn();
    mockUseAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
      logout: mockLogout,
    });
    
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
        ok: true,
      });

    const user = userEvent.setup();
    renderWithMockProviders(<DashboardEmpleado />);
    
    await screen.findByRole("button", { name: /cerrar sesión/i });
    
    const logoutButton = screen.getByRole("button", { name: /cerrar sesión/i });
    await user.click(logoutButton);
    
    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith("http://localhost:5000/usuarios/logout", {
      method: "POST",
      credentials: "include",
    });
    expect(mockLogout).toHaveBeenCalled();
  });

  it("maneja error en fetch de perfil", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Error de red"));
    
    renderWithMockProviders(<DashboardEmpleado />);
    
    await screen.findByText(/Panel de empleado/i);
    
    expect(screen.getByText(/Tienda: Asignada/i)).toBeInTheDocument();
  });
});