// /test/setupTests.jsx - Setup global para Vitest
import { expect, afterEach } from "vitest"; //Importa lo básico
import { cleanup } from "@testing-library/react";//Limpia luego de cada test
import "@testing-library/jest-dom";

// Limpia el DOM después de cada prueba
afterEach(() => {
  cleanup();
});

// Polyfill para window.matchMedia
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return false;
      },
    };
  };
}

// Polyfill para MutationObserver
if (
  typeof window !== "undefined" &&
  typeof window.MutationObserver === "undefined"
) {
  window.MutationObserver = class {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
  };
}

// Polyfill para requestAnimationFrame
if (typeof window !== "undefined" && !window.requestAnimationFrame) {
  window.requestAnimationFrame = function (cb) {
    return setTimeout(cb, 0);
  };
  window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
}

//Global para fetch
if (typeof globalThis.fetch === "undefined") {
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({}),
    text: async () => "",
  });
}

//Mock para localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});