import { defineConfig } from "@playwright/test";

/**
 * Pruebas E2E de CafeGestión.
 * Requisito: backend en http://localhost:4000 y frontend en http://localhost:3000 ya corriendo.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on",
    screenshot: "on",
    video: "retain-on-failure",
    locale: "es-CO",
  },
});
