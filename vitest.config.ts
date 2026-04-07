import { defineConfig } from "vitest/config"
export default defineConfig({
  test: {
    globals: true,
    include: ["test/**/*.spec.ts"],
    exclude: ["test/integration/**"],
    testTimeout: 15000,
  },
})
