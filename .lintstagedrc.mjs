export default {
  "*.{md,json,yaml,yml,ts,tsx}": "prettier --write",
  ".github/workflows/checks.yml": () => "pnpm sync:playwright",
};
