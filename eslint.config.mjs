import confusingBrowserGlobals from "confusing-browser-globals";
import importPlugin from "eslint-plugin-import-x";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["docs/**", "lib/**", "coverage/**", "src/typechain/**"],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
  tseslint.configs.recommended,
  importPlugin.flatConfigs.errors,
  importPlugin.flatConfigs.warnings,
  importPlugin.flatConfigs.typescript,
  prettierPlugin,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      "import-x/resolver": {
        node: {
          extensions: [".js", ".ts", ".tsx", ".json"],
        },
        typescript: {
          alwaysTryTypes: true,
          project: "src",
        },
      },
    },
    rules: {
      "no-restricted-globals": ["error", ...confusingBrowserGlobals],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["src/**", "!src/*"],
              message: "Please use relative import for `src` files.",
            },
          ],
        },
      ],
      curly: ["error"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-require-imports": "off",
      "import-x/no-rename-default": "off",
      "import-x/no-named-as-default-member": "off",
      "import-x/order": [
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
      "import-x/no-unused-modules": "off",
      "no-control-regex": "off",
      "object-shorthand": ["error", "always"],
    },
  },
  // Test files: allow chai expressions and sinon namespace usage
  {
    files: ["test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "import-x/namespace": "off",
    },
  },
);
