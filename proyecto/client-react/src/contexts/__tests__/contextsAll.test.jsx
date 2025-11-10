//TEST GENERAL DE ESPORTACIONES DE CONTEXTS
//se usa una funcion de vitest para importar todos los modulos bajo /src/contexts
import React from "react";
import { describe, it, expect } from "vitest";

describe("contexts directory exports", () => {
  it("imports all modules under /src/contexts and they export something", () => {
    const modules = import.meta.globEager("/src/contexts/**/*.{js,jsx,ts,tsx}");
    const paths = Object.keys(modules);
    expect(paths.length).toBeGreaterThan(0);
    for (const p of paths) {
      const mod = modules[p];
      const hasDefault = typeof mod.default !== "undefined";  // Corrige la comparación
      const hasNamed = Object.keys(mod).length > 0;
      expect(hasDefault || hasNamed).toBe(true);
    }
  });
});