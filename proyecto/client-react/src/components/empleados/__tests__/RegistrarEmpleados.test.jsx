import React from "react";
import { renderWithProviders, screen, waitFor } from "../../../test/test-utils"; // Usamos renderWithProviders para consistencia
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event"; // Para interacciones realistas
import RegistrarEmpleado from "../RegistrarEmpleado"; // Importamos el componente

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

// Mockeamos íconos de react-icons/fa para evitar dependencias
vi.mock("react-icons/fa", () => ({
  FaEye: () => <div data-testid="fa-eye">Eye</div>,
  FaEyeSlash: () => <div data-testid="fa-eye-slash">EyeSlash</div>,
  FaEdit: () => <div data-testid="fa-edit">Edit</div>,
  FaToggleOn: () => <div data-testid="fa-toggle-on">ToggleOn</div>,
  FaToggleOff: () => <div data-testid="fa-toggle-off">ToggleOff</div>,
}));

// Mockeamos fetch globalmente para controlar todas las llamadas a la API
global.fetch = vi.fn();

describe("RegistrarEmpleado Component", () => {
  // Limpiamos mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Configuración por defecto antes de cada test
  beforeEach(() => {
    useAuthContext.mockReturnValue({
      isOwner: true, // Simula que el usuario es dueño
    });
    // Mock por defecto para fetches (tiendas y empleados vacíos)
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ([]), // Respuesta vacía por defecto
    });
  });

  // Test: Renderiza correctamente el formulario y lista
  it("renderiza correctamente el formulario de registro y lista de empleados", async () => {
    // Mock fetch para tiendas y empleados
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id_tienda: 1, nombre: "Tienda A", ubicacion: "Centro" }]), // Tiendas
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id_empleado: 1, nombre: "Juan", apellido: "Pérez", email: "juan@example.com", puesto_trabajo: "Vendedor", tienda_nombre: "Tienda A", activo: 1 }]), // Empleados
      });

    renderWithProviders(<RegistrarEmpleado />);
    
    // Espera que cargue
    await screen.findByText(/gestión de empleados/i);
    
    // Verifica títulos y elementos principales
    expect(screen.getByText(/gestión de empleados/i)).toBeInTheDocument();
    expect(screen.getByText(/registrar nuevo empleado/i)).toBeInTheDocument();
    expect(screen.getByText(/empleados registrados/i)).toBeInTheDocument();
    
    // Verifica inputs del formulario
    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/cree una contraseña/i)).toBeInTheDocument();
    
    // Verifica select de tienda
    expect(screen.getByText("Tienda A - Centro (ID: 1)")).toBeInTheDocument();
    
    // Verifica lista de empleados
    expect(screen.getByText("Juan Pérez - juan@example.com - Vendedor - Tienda A")).toBeInTheDocument();
    
    // Verifica botones
    expect(screen.getByRole("button", { name: /registrar empleado/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /desactivar/i })).toBeInTheDocument();
  });

  // Test: Muestra "Cargando tiendas..." mientras carga
  it("muestra 'Cargando tiendas...' mientras se cargan las tiendas", () => {
    // Mock fetch que no resuelve inmediatamente
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    renderWithProviders(<RegistrarEmpleado />);
    
    expect(screen.getByText(/cargando tiendas/i)).toBeInTheDocument();
  });

  // Test: Envía el formulario de registro exitosamente
  it("envía el formulario de registro y registra empleado exitosamente", async () => {
    // Mock fetch: Tiendas, empleados, registro, recarga empleados
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_tienda: 1, nombre: "Tienda A", ubicacion: "Centro" }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // Registro exitoso
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_empleado: 2, nombre: "Ana", apellido: "Gómez", email: "ana@example.com", puesto_trabajo: "Cajera", tienda_nombre: "Tienda A", activo: 1 }]) }); // Recarga empleados
    
    // Mock window.alert
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const user = userEvent.setup();
    renderWithProviders(<RegistrarEmpleado />);
    
    // Espera que cargue
    await screen.findByPlaceholderText(/nombre/i);
    
    // Llena el formulario
    await user.type(screen.getByPlaceholderText(/nombre/i), "Ana");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Gómez");
    await user.type(screen.getByPlaceholderText(/email/i), "ana@example.com");
    await user.selectOptions(screen.getByRole("combobox"), "1"); // Selecciona tienda
    await user.type(screen.getByPlaceholderText(/puesto de trabajo/i), "Cajera");
    await user.type(screen.getByPlaceholderText(/teléfono/i), "123456789");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.click(screen.getByText("Femenino")); // Selecciona género
    
    // Envía
    await user.click(screen.getByRole("button", { name: /registrar empleado/i }));
    
    // Verifica que fetch haya sido llamado para registro
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/empleados/registro_por_dueno", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "Ana", apellido: "Gómez", email: "ana@example.com", id_tienda: 1, puesto_trabajo: "Cajera", telefono: "123456789", genero: "F", password: "Password123!",
      }),
      credentials: "include",
    });
    // Verifica alerta de éxito
    expect(mockAlert).toHaveBeenCalledWith("Empleado registrado exitosamente.");
    
    mockAlert.mockRestore();
  });

  // Test: Muestra error si faltan campos en registro
  it("muestra error si faltan campos en el registro", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_tienda: 1, nombre: "Tienda A", ubicacion: "Centro" }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([]) });
    
    const user = userEvent.setup();
    renderWithProviders(<RegistrarEmpleado />);
    
    // Espera que cargue
    await screen.findByPlaceholderText(/nombre/i);
    
    // Envía sin llenar campos
    await user.click(screen.getByRole("button", { name: /registrar empleado/i }));
    
    // Verifica error
    expect(screen.getByText("Por favor, complete todos los campos.")).toBeInTheDocument();
  });

  // Test: Maneja error en registro
  it("maneja error en el registro de empleado", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_tienda: 1, nombre: "Tienda A", ubicacion: "Centro" }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([]) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Email ya existe" }) });
    
    const user = userEvent.setup();
    renderWithProviders(<RegistrarEmpleado />);
    
    // Espera que cargue y llena campos mínimos
    await screen.findByPlaceholderText(/nombre/i);
    await user.type(screen.getByPlaceholderText(/nombre/i), "Ana");
    await user.type(screen.getByPlaceholderText(/apellido/i), "Gómez");
    await user.type(screen.getByPlaceholderText(/email/i), "ana@example.com");
    await user.selectOptions(screen.getByRole("combobox"), "1");
    await user.type(screen.getByPlaceholderText(/puesto de trabajo/i), "Cajera");
    await user.type(screen.getByPlaceholderText(/teléfono/i), "123456789");
    await user.type(screen.getByPlaceholderText(/cree una contraseña/i), "Password123!");
    await user.click(screen.getByText("Femenino"));
    
    // Envía
    await user.click(screen.getByRole("button", { name: /registrar empleado/i }));
    
    // Verifica error
    expect(screen.getByText("Email ya existe")).toBeInTheDocument();
  });

  // Test: activa/desactiva empleado
  it("toggle activa/desactiva empleado", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_tienda: 1, nombre: "Tienda A", ubicacion: "Centro" }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_empleado: 1, nombre: "Juan", apellido: "Pérez", email: "juan@example.com", puesto_trabajo: "Vendedor", tienda_nombre: "Tienda A", activo: 1 }]) })
      .mockResolvedValueOnce({ ok: true }) // Toggle
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_empleado: 1, nombre: "Juan", apellido: "Pérez", email: "juan@example.com", puesto_trabajo: "Vendedor", tienda_nombre: "Tienda A", activo: 0 }]) }); // Recarga
    
    const user = userEvent.setup();
    renderWithProviders(<RegistrarEmpleado />);
    
    // Espera que cargue
    await screen.findByText("Juan Pérez");
    
    // Haz clic en toggle
    await user.click(screen.getByRole("button", { name: /desactivar/i }));
    
    // Verifica que fetch haya sido llamado para toggle
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/empleados/desactivar/1", {
      method: "PATCH",
      credentials: "include",
    });
  });

  // Test: Abre modal de edición
  it("abre el modal de edición al hacer clic en 'Editar'", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_tienda: 1, nombre: "Tienda A", ubicacion: "Centro" }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_empleado: 1, nombre: "Juan", apellido: "Pérez", email: "juan@example.com", puesto_trabajo: "Vendedor", tienda_nombre: "Tienda A", activo: 1 }]) });
    
    const user = userEvent.setup();
    renderWithProviders(<RegistrarEmpleado />);
    
    // Espera que cargue
    await screen.findByText("Juan Pérez");
    
    // Haz clic en editar
    await user.click(screen.getByRole("button", { name: /editar/i }));
    
    // Verifica que el modal aparezca
    expect(screen.getByText(/editar empleado/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Juan")).toBeInTheDocument();
  });

  // Test: No permite editar empleados inactivos
  it("no permite editar empleados inactivos", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_tienda: 1, nombre: "Tienda A", ubicacion: "Centro" }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_empleado: 1, nombre: "Juan", apellido: "Pérez", email: "juan@example.com", puesto_trabajo: "Vendedor", tienda_nombre: "Tienda A", activo: 0 }]) });
    
    renderWithProviders(<RegistrarEmpleado />);
    
    // Espera que cargue
    await screen.findByText("Juan Pérez");
    
    // Verifica que el botón de editar esté deshabilitado
    const editButton = screen.getByRole("button", { name: /editar/i });
    expect(editButton).toBeDisabled();
  });

  // Test: Guarda edición exitosamente
  it("guarda la edición del empleado exitosamente", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_tienda: 1, nombre: "Tienda A", ubicacion: "Centro" }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_empleado: 1, nombre: "Juan", apellido: "Pérez", email: "juan@example.com", puesto_trabajo: "Vendedor", tienda_nombre: "Tienda A", activo: 1 }]) })
      .mockResolvedValueOnce({ ok: true }) // Edición
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id_empleado: 1, nombre: "Juan Editado", apellido: "Pérez", email: "juan@example.com", puesto_trabajo: "Vendedor", tienda_nombre: "Tienda A", activo: 1 }]) }); // Recarga
    
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const user = userEvent.setup();
    renderWithProviders(<RegistrarEmpleado />);
    
    // Espera que cargue y abre edición
    await screen.findByText("Juan Pérez");
    await user.click(screen.getByRole("button", { name: /editar/i }));
    
    // Edita nombre
    const nombreInput = screen.getByDisplayValue("Juan");
    await user.clear(nombreInput);
    await user.type(nombreInput, "Juan Editado");
    
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));
    
    // Verifica que fetch haya sido llamado para edición
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/empleados/editar/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "Juan Editado", apellido: "Pérez", email: "juan@example.com", puesto_trabajo: "Vendedor", telefono: "", genero: "", password: "",
      }),
      credentials: "include",
    });
    expect(mockAlert).toHaveBeenCalledWith("Empleado actualizado.");
    
    mockAlert.mockRestore();
  });

  // Test: Redirige si no es owner
  it("redirige si el usuario no es owner", () => {
    useAuthContext.mockReturnValue({
      isOwner: false,
    });
    
    renderWithProviders(<RegistrarEmpleado />);
    
    // Verifica redirección
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(screen.getByText("Redirigiendo...")).toBeInTheDocument();
  });
});