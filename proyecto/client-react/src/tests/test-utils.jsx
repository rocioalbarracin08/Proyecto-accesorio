import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Render helper: envuelve por defecto en Router. Agregá providers (Context, QueryClient, Redux) si los necesitás.
export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      {children}
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export queries para conveniencia
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
