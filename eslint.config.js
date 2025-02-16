// @ts-check
import eslint from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import solid from "eslint-plugin-solid";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "src/env.d.ts",
      "src/worker.d.ts",
      "dist/**",
      ".vinxi/**",
      ".wrangler/**",
      ".output/**",
      "app.config.timestamp_*",
      "src/worker.d.ts"
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  jsxA11y.flatConfigs.recommended,
  solid.configs["flat/typescript"],
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off"
    }
  }
);
