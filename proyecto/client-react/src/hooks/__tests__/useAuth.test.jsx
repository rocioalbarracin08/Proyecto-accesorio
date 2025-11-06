import "../../../test/setupTests";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react-hooks";
// Ajusta el path al hook real:
// import useAuth from '../hooks/useAuth';

// Ejemplo genérico: hook que devuelve user y login
// Si tenés el hook real, reemplaza la siguiente implementación por la import real.
function useAuthMock() {
  const [user, setUser] = React.useState(null);
  const login = (name) => setUser({ name });
  const logout = () => setUser(null);
  return { user, login, logout };
}

describe("useAuth hook (ejemplo)", () => {
  it("allows login and logout", () => {
    const { result } = renderHook(() => useAuthMock());

    expect(result.current.user).toBeNull();

    act(() => {
      result.current.login("Juan");
    });

    expect(result.current.user).toEqual({ name: "Juan" });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });
});
