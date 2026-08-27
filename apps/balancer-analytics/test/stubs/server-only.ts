// Vitest stub for Next.js's `server-only` virtual module, which only exists
// during a Next build. Modules that `import 'server-only'` (e.g. the dune
// fetchers) can't resolve it under vitest, so we alias it here to a no-op.
export {}
