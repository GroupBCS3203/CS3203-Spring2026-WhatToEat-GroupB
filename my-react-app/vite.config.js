import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,       // use global test/expect
    environment: "jsdom", // emulate browser
    setupFiles: "./vitest.setup.js" // optional, for global mocks
  }
});