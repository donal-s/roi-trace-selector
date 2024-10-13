import jest from "eslint-plugin-jest";
import react from "eslint-plugin-react";
import js from "@eslint/js";
import globals from "globals";
import ts from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default ts.config(
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  react.configs.flat.recommended,
  jest.configs["flat/recommended"],
  eslintPluginPrettierRecommended
);
