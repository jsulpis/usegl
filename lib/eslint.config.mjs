import unjs from "eslint-config-unjs";

export default unjs({
  rules: {
    "unicorn/filename-case": "off",
    "unicorn/no-null": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/triple-slash-reference": "off",
    "unicorn/prefer-top-level-await": "off",
    "no-console": ["error", { allow: ["warn", "error", "info"] }],
  },
});
