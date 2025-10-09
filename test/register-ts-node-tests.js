// Use ts-node with a test-only tsconfig to enable ESM/CJS interop in tests
require("ts-node").register({
  project: require("path").resolve(__dirname, "../tsconfig.tests.json"),
  transpileOnly: true,
});
