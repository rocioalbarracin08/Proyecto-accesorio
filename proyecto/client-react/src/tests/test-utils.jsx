import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Importá tus contextos
import { AuthProvider } from "../src/contexts/AuthContext";
import { CarritoProvider } from "../src/contexts/CarritoContext";
import { PromocionesProvider } from "../src/contexts/PromocionesContext";

// Render helper con todos tus providers
export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <CarritoProvider>
          <PromocionesProvider>
            {children}
          </PromocionesProvider>
        </CarritoProvider>
      </AuthProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// Reexporta todo lo útil de testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
