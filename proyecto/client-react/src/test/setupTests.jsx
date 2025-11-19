// src/test/setupTests.jsx
import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import path from "path"


console.log("setup loaded")
// Guardar fetch original para restaurarlo
const originalFetch = globalThis.fetch;

// Limpia el DOM y restaura mocks después de cada prueba
afterEach(() => {
  cleanup();
  // Restaurar mocks de vi
  vi.restoreAllMocks();
  // Restaurar fetch global al comportamiento por defecto (si no existe, dejar un mock básico)
  globalThis.fetch = originalFetch ?? vi.fn(() => Promise.resolve({ ok: true, json: async () => ({}) }));
});

// Polyfills para jsdom si son necesarios (matchMedia, MutationObserver, rAF, localStorage)
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = function () {
    return {
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return false; },
    };
  };
}

if (typeof window !== "undefined" && typeof window.MutationObserver === "undefined") {
  window.MutationObserver = class {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() { return []; }
  };
}

console.log("setupTests.jsx loaded from:", __dirname);  // Muestra la ruta real

if (typeof window !== "undefined" && !window.requestAnimationFrame) {
  window.requestAnimationFrame = function (cb) { return setTimeout(cb, 0); };
  window.cancelAnimationFrame = function (id) { clearTimeout(id); };
}

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => (store[key] ?? null),
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });