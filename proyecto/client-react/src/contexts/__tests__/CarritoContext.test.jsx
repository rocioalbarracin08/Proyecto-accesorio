import { renderHook, act } from "@testing-library/react";
import { CarritoProvider, useCarrito } from "../../contexts/CarritoContext";
import React from "react";

describe("CarritoContext", () => {
  it("agrega un item al carrito", () => {
    const wrapper = ({ children }) => <CarritoProvider>{children}</CarritoProvider>;
    const { result } = renderHook(() => useCarrito(), { wrapper });

    act(() => {
      result.current.addItem({ id_producto: 1, precio: 100 });
    });

    expect(result.current.state.totalItems).toBe(1);
    expect(result.current.state.totalPrice).toBe(100);
  });
});
