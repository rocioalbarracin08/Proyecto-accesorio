import React from "react";
import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuthContext } from "../AuthContext";
import { describe, it, expect } from "vitest";

// Componente de prueba que usa el contexto
function TestComponent() {
  const { isLogged, login, logout } = useAuthContext();
  return (
    <>
      <p>Logged: {isLogged ? "Yes" : "No"}</p>
      <button onClick={login}>Login</button>
      <button onClick={logout}>Logout</button>
    </>
  );
}

describe("AuthContext", () => {
  it("renders and provides default context values", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText(/logged: no/i)).toBeInTheDocument();
  });
});
