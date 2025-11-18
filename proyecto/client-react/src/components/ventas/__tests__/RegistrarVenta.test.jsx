// /test/RegistrarVenta.test.jsx
import React from "react";
import { renderWithMockProviders, screen, fireEvent, waitFor } from "../../test/test-utils";
import { vi, describe, it, expect } from "vitest";
import RegistrarVenta from "../RegistrarVenta"; // Ajusta la ruta según tu estructura

// Mockea el contexto AuthContext
vi.mock("../../contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Importa el mock para configurarlo
import { useAuthContext } from "../../contexts/AuthContext";

describe("RegistrarVenta Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock básico para fetch (se reasignará en tests específicos)
    global.fetch = vi.fn((url) => {
      if (url.includes("/productos/mostrar")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            productos: [
              { id_producto: 1, name: "Producto A", precio: 10, stock: 5 },
              { id_producto: 2, name: "Producto B", precio: 20, stock: 0 },
            ],
          }),
        });
      }
      if (url.includes("/metodos_pagos")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id_metodo_pago: 1, name: "Efectivo" },
            { id_metodo_pago: 2, name: "Tarjeta" },
          ],
        });
      }
      // Valor por defecto
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  it("Redirige a /login si no está logueado o no es empleado", () => {
    useAuthContext.mockReturnValue({
      isLogged: false,
      userRole: "cliente",
    });

    const mockLocation = { href: "" };
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    renderWithMockProviders(<RegistrarVenta />);
    expect(mockLocation.href).toBe("/login");
  });

  it("Carga productos y métodos de pago al montar para empleado logueado", async () => {
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
    });

    renderWithMockProviders(<RegistrarVenta />);

    await waitFor(() => {
      expect(screen.getByText(/producto a/i)).toBeInTheDocument();
      expect(screen.getByText(/producto b/i)).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue(/efectivo/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/tarjeta/i)).toBeInTheDocument();
  });

  it("Busca clientes cuando se escribe en el campo de búsqueda", async () => {
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
    });

    // Mock para búsqueda de clientes
    global.fetch = vi.fn((url) => {
      if (url.includes("/productos/mostrar")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ productos: [] }),
        });
      }
      if (url.includes("/metodos_pagos")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      if (url.includes("/clientes?busqueda=test")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id_cliente: 1, name: "Juan", apellido: "Perez", email: "juan@test.com" },
          ],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithMockProviders(<RegistrarVenta />);

    const inputCliente = screen.getByPlaceholderText(/nombre o email del cliente/i);
    fireEvent.change(inputCliente, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText(/juan perez - juan@test.com/i)).toBeInTheDocument();
    });
  });

  it("Selecciona un cliente de la lista", async () => {
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
    });

    // Mock para búsqueda
    global.fetch = vi.fn((url) => {
      if (url.includes("/productos/mostrar")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ productos: [] }),
        });
      }
      if (url.includes("/metodos_pagos")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      if (url.includes("/clientes?busqueda=juan")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id_cliente: 1, name: "Juan", apellido: "Perez", email: "juan@test.com" },
          ],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithMockProviders(<RegistrarVenta />);

    const inputCliente = screen.getByPlaceholderText(/nombre o email del cliente/i);
    fireEvent.change(inputCliente, { target: { value: "juan" } });

    await waitFor(() => {
      const clienteItem = screen.getByText(/juan perez - juan@test.com/i);
      fireEvent.click(clienteItem);
    });

    expect(inputCliente.value).toBe("Juan Perez");
  });

  it("Selecciona 'Venta sin cliente registrado'", () => {
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
    });

    renderWithMockProviders(<RegistrarVenta />);

    const btnSinCliente = screen.getByRole("button", { name: /venta sin cliente registrado/i });
    fireEvent.click(btnSinCliente);

    const inputCliente = screen.getByPlaceholderText(/nombre o email del cliente/i);
    expect(inputCliente.value).toBe("Venta sin cliente registrado");
  });

  it("Busca productos cuando se escribe en el campo de búsqueda", async () => {
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
    });

    // Mock para búsqueda de productos
    global.fetch = vi.fn((url) => {
      if (url.includes("/productos/mostrar")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ productos: [] }),
        });
      }
      if (url.includes("/metodos_pagos")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      if (url.includes("/productos/buscar?q=prod")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            resultados: [{ id_producto: 1, name: "Producto A", precio: 10, stock: 5 }],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithMockProviders(<RegistrarVenta />);

    const inputProducto = screen.getByPlaceholderText(/buscar productos/i);
    fireEvent.change(inputProducto, { target: { value: "prod" } });

    await waitFor(() => {
      expect(screen.getByText(/producto a/i)).toBeInTheDocument();
    });
  });

  it("Agrega y remueve productos de la venta", async () => {
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
    });

    renderWithMockProviders(<RegistrarVenta />);

    await waitFor(() => {
      expect(screen.getByText(/producto a/i)).toBeInTheDocument();
    });

    // Agregar producto
    const inputCant = screen.getByPlaceholderText(/cant/i);
    fireEvent.change(inputCant, { target: { value: "2" } });

    await waitFor(() => {
      expect(screen.getByText(/productos agregados/i)).toBeInTheDocument();
      expect(screen.getByText(/producto a x 2/i)).toBeInTheDocument();
    });

    // Verificar total
    expect(screen.getByText(/total: \$20.00/i)).toBeInTheDocument();

    // Remover producto
    const btnRemover = screen.getByRole("button", { name: /remover/i });
    fireEvent.click(btnRemover);

    await waitFor(() => {
      expect(screen.queryByText(/productos agregados/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/total: \$0.00/i)).toBeInTheDocument();
  });

  it("Muestra error si intenta registrar sin productos", async () => {
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
    });

    renderWithMockProviders(<RegistrarVenta />);

    const btnSubmit = screen.getByRole("button", { name: /registrar venta/i });
    fireEvent.click(btnSubmit);

    expect(screen.getByText(/agrega al menos un producto/i)).toBeInTheDocument();
  });

  it("Registra venta exitosamente", async () => {
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
    });

    // Mock para submit
    global.fetch = vi.fn((url) => {
      if (url.includes("/productos/mostrar")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            productos: [{ id_producto: 1, name: "Producto A", precio: 10, stock: 5 }],
          }),
        });
      }
      if (url.includes("/metodos_pagos")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id_metodo_pago: 1, name: "Efectivo" }],
        });
      }
      if (url.includes("/ventas/registrar_venta")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ mensaje: "Venta registrada exitosamente" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithMockProviders(<RegistrarVenta />);

    await waitFor(() => {
      expect(screen.getByText(/producto a/i)).toBeInTheDocument();
    });

    // Seleccionar método de pago
    const selectPago = screen.getByRole("combobox");
    fireEvent.change(selectPago, { target: { value: "1" } });

    // Agregar producto
    const inputCant = screen.getByPlaceholderText(/cant/i);
    fireEvent.change(inputCant, { target: { value: "1" } });

    await waitFor(() => {
      expect(screen.getByText(/productos agregados/i)).toBeInTheDocument();
    });

    // Submit
    const btnSubmit = screen.getByRole("button", { name: /registrar venta/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(screen.getByText(/venta registrada exitosamente/i)).toBeInTheDocument();
    });
  });

  it("Muestra error si falla el registro de venta", async () => {
    useAuthContext.mockReturnValue({
      isLogged: true,
      userRole: "empleado",
    });

    // Mock para submit con error
    global.fetch = vi.fn((url) => {
      if (url.includes("/productos/mostrar")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            productos: [{ id_producto: 1, name: "Producto A", precio: 10, stock: 5 }],
          }),
        });
      }
      if (url.includes("/metodos_pagos")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id_metodo_pago: 1, name: "Efectivo" }],
        });
      }
      if (url.includes("/ventas/registrar_venta")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ error: "Error al registrar venta" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderWithMockProviders(<RegistrarVenta />);

    await waitFor(() => {
      expect(screen.getByText(/producto a/i)).toBeInTheDocument();
    });

    // Seleccionar método de pago
    const selectPago = screen.getByRole("combobox");
    fireEvent.change(selectPago, { target: { value: "1" } });

    // Agregar producto
    const inputCant = screen.getByPlaceholderText(/cant/i);
    fireEvent.change(inputCant, { target: { value: "1" } });

    await waitFor(() => {
      expect(screen.getByText(/productos agregados/i)).toBeInTheDocument();
    });

    // Submit
    const btnSubmit = screen.getByRole("button", { name: /registrar venta/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(screen.getByText(/error al registrar venta/i)).toBeInTheDocument();
    });
  });
});
