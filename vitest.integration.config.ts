import { defineConfig, mergeConfig } from "vitest/config"
import baseConfig from "./vitest.config.base"

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["test/integration/**/*.spec.ts"],
      testTimeout: 30000,
      setupFiles: ["dotenv/config"],
    },
  }),
)
