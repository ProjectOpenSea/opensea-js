import { defineConfig, mergeConfig } from "vitest/config"
import baseConfig from "./vitest.config.base"

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["test/**/*.spec.ts"],
      exclude: ["test/integration/**"],
      testTimeout: 15000,
    },
  }),
)
