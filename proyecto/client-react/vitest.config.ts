import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // setup file que se ejecuta antes de todos los tests
    setupFiles: ["./test/setupTests.jsx"],
    globals: true,
    include: [
      "src/**/*.test.{js,jsx,ts,tsx}",
      "test/**/*.test.{js,jsx,ts,tsx}",
    ],
    deps: { inline: [] },
  },
});
