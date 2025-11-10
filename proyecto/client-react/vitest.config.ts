import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setupTests.jsx"],
    globals: true,
    include: ["src/**/*.test.{js,jsx,ts,tsx}", "test/**/*.test.{js,jsx,ts,tsx}"],
  },
});
