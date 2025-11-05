import "../../../test/setupTests";
import { describe, it, expect } from "vitest";

describe("hooks directory exports", () => {
  it("imports all modules under /src/hooks and they export something", () => {
    const modules = import.meta.globEager("/src/hooks/**/*.{js,jsx,ts,tsx}");
    const paths = Object.keys(modules);
    // Si no hay hooks, falla para que lo revises
    expect(paths.length).toBeGreaterThan(0);
    for (const p of paths) {
      const mod = modules[p];
      const hasDefault = typeof mod.default !== "undefined";
      const hasNamed = Object.keys(mod).length > 0;
      expect(hasDefault || hasNamed).toBe(true);
    }
  });
});
