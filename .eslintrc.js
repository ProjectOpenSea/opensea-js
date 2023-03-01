const restrictedGlobals = require("confusing-browser-globals");

module.exports = {
  env: {
    browser: true,
    node: true,
  },
  root: true,
  ignorePatterns: ["docs", "lib"],
  reportUnusedDisableDirectives: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import", "jest", "prettier"],

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  rules: {
    "no-restricted-globals": ["error"].concat(restrictedGlobals),
    curly: ["error"],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-var-requires": "off",
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal"],
        "newlines-between": "never",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "import/no-unused-modules": [1, { unusedExports: true }],
    "no-control-regex": "off",

    "object-shorthand": ["error", "always"],
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", ".tsx", ".json"],
      },
      typescript: {
        alwaysTryTypes: true,
        project: "src",
      },
    },
  },
};
