import { defineConfig } from "vitest/config"
export default defineConfig({
  test: {
    globals: true,
    include: ["test/integration/**/*.spec.ts"],
    testTimeout: 30000,
    setupFiles: ["dotenv/config"],
  },
})
