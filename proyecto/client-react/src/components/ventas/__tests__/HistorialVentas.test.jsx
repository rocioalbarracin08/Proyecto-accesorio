// /test/HistorialVentas.test.jsx
import React from "react";
import { renderWithMockProviders, screen, waitFor } from "../../test/test-utils";
import { vi, describe, it, expect } from "vitest";
import HistorialVentas from "../HistorialVentas"; // Ajusta la ruta según tu estructura

// Mockea el contexto AuthContext para controlar isLogged, userRole, authChecked
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Importa el mock para poder configurarlo en cada test
import { useAuthContext } from "../../contexts/AuthContext";

describe("HistorialVentas Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock básico para fetch (se reasignará en tests específicos)
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          ventas: [
            {
              id_factura: 1,
              fecha: "2023-10-01",
              hora: "10:00",
              nombre_tienda: "Tienda A",
              metodo_pago: "Efectivo",
              costo_total: 100,
              productos: "Producto 1, Producto 2",
            },
          ],
          total_pages: 2,
        }),
      })
    );
  });

  it("Renderiza loading inicialmente cuando authChecked es false", () => {
    // Configura el mock del contexto: no autenticado aún
    useAuthContext.mockReturnValue({
      isLogged: false,
      userRole: null,
      authChecked: false,
    });

    renderWithMockProviders(<HistorialVentas />);
    expect(screen.getByText(/cargando historial/i)).toBeInTheDocument();
  });

  it("Redirige a /login si no está logueado o no es empleado", () => {
    // Configura el mock: autenticado pero no empleado
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "cliente", // No es 'empleado'
      authChecked: true,
    });

    // Mockea window.location para verificar la redirección
    const mockLocation = { href: "" };
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    renderWithMockProviders(<HistorialVentas />);
    // En el useEffect, debería setear window.location.href = '/login'
    // Pero como es asíncrono, esperamos un poco o verificamos que no renderiza el contenido
    expect(mockLocation.href).toBe("/login");
  });

  it("Carga y muestra ventas exitosamente para empleado logueado", async () => {
    // Configura el mock: empleado logueado
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
      authChecked: true,
    });

    renderWithMockProviders(<HistorialVentas />);

    // Espera a que se resuelva el fetch y se quite el loading
    await waitFor(() => {
      expect(screen.queryByText(/cargando historial/i)).not.toBeInTheDocument();
    });

    // Verifica que se renderiza el título y la venta
    expect(screen.getByText(/mis ventas registradas/i)).toBeInTheDocument();
    expect(screen.getByText(/factura #1/i)).toBeInTheDocument();
    expect(screen.getByText(/tienda: tienda a/i)).toBeInTheDocument();
    expect(screen.getByText(/total: \$100/i)).toBeInTheDocument();

    // Verifica paginación
    expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeInTheDocument();
  });

  it("Muestra mensaje cuando no hay ventas", async () => {
    // Configura el mock: empleado logueado
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
      authChecked: true,
    });

    // Mockea fetch para devolver lista vacía
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          ventas: [],
          total_pages: 1,
        }),
      })
    );

    renderWithMockProviders(<HistorialVentas />);

    await waitFor(() => {
      expect(screen.queryByText(/cargando historial/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/no tienes ventas registradas aún/i)).toBeInTheDocument();
  });
});
