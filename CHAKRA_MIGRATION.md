# Chakra UI v2 → v3 Migration

## Context

- Monorepo with 2 apps (`frontend-v3`, `beets-frontend-v3`) and shared `packages/lib`
- ~694 files importing from `@chakra-ui/*`
- 71 files using `framer-motion` independently (not just as a Chakra peer dep)
- 24 files use the `as={motion.X}` pattern (Chakra component + framer-motion)
- Color mode is managed via `next-themes`, NOT Chakra's built-in `ColorModeProvider`
- Complex theme system: `extendTheme` with semantic tokens, component overrides, 3 app themes (bal, cow, beets)
- Third-party Chakra libs: `chakra-react-select`, `@nikolovlazar/chakra-ui-prose`

## Constraints

- **Do NOT remove `framer-motion`** — it is used independently throughout the app, not just as a Chakra peer dep
- **Do NOT change the `next-themes` setup** — it drives all color mode state
- **Preserve multi-theme support** — `bal`, `cow`, and `beets` themes must all work, including runtime switching between `bal` and `cow` in `frontend-v3`
- **Preserve `cssVarsRoot="body"`** equivalent in v3 if one exists

---

## Phase 1 — Research & Compatibility Check

Use the Chakra UI MCP server to read the v3 migration guide and understand:
- All breaking changes from v2 to v3
- The new `createSystem` / `defineConfig` theme API
- How `ChakraProvider` changed (it now takes `value={system}` not `theme={theme}`)
- What happened to: `@chakra-ui/icons`, `@chakra-ui/anatomy`, `@chakra-ui/clickable`, `@chakra-ui/hooks`, `@chakra-ui/theme-tools`, `@chakra-ui/next-js`, `@chakra-ui/styled-system`
- New color mode handling and how to integrate with `next-themes`
- How semantic tokens changed
- What the official codemod covers and what it does not

Check compatibility of:
- `chakra-react-select` (currently v5.0.5) — find the v3-compatible version
- `@nikolovlazar/chakra-ui-prose` (currently v1.2.1) — find v3-compatible version or replacement
- Verify `framer-motion` v12 works with Chakra v3, especially the `as={motion.X}` pattern

Read these key files before making any changes:
- `packages/lib/package.json`
- `packages/lib/shared/services/chakra/themes/base/foundations.ts`
- `packages/lib/shared/services/chakra/themes/base/tokens.ts`
- `packages/lib/shared/services/chakra/themes/base/semantic-tokens.ts`
- `packages/lib/shared/services/chakra/themes/base/components.ts`
- `apps/frontend-v3/lib/services/chakra/themes/bal/bal.theme.ts`
- `apps/frontend-v3/lib/services/chakra/themes/cow/cow.theme.ts`
- `apps/beets-frontend-v3/lib/services/chakra/themes/beets/beets.theme.ts`
- `apps/frontend-v3/lib/services/chakra/ThemeProvider.tsx`
- `apps/beets-frontend-v3/lib/services/chakra/ThemeProvider.tsx`
- `apps/frontend-v3/app/layout.tsx`

---

## Phase 2 — Run the Official Codemod

Run the Chakra UI v3 codemod on the entire codebase:

```bash
npx @chakra-ui/codemod@latest migrate packages/lib
npx @chakra-ui/codemod@latest migrate apps/frontend-v3
npx @chakra-ui/codemod@latest migrate apps/beets-frontend-v3
```

After each run, review what changed and note what was NOT handled (theme migration, semantic tokens, removed packages). Do not commit yet.

---

## Phase 3 — Dependency Updates

Update `packages/lib/package.json`.

Remove these packages (consolidated into `@chakra-ui/react` v3 or deprecated):
- `@chakra-ui/anatomy`
- `@chakra-ui/clickable`
- `@chakra-ui/hooks`
- `@chakra-ui/next-js`
- `@chakra-ui/theme-tools`
- `@chakra-ui/styled-system` (devDependency)
- `@chakra-ui/cli` (devDependency — check if still needed for v3)

Update:
- `@chakra-ui/react`: `2.10.6` → latest v3
- `@chakra-ui/icons`: `2.2.4` → latest compatible version (or remove if replaced in v3)
- `chakra-react-select` → v3-compatible version
- `@nikolovlazar/chakra-ui-prose` → v3-compatible version or find replacement

Verify (keep if still required by Chakra v3):
- `@emotion/react`
- `@emotion/styled`

Run `pnpm install` from the root after updating.

---

## Phase 4 — Theme System Migration (highest complexity)

Migrate the entire theme from `extendTheme` (v2) to `createSystem`/`defineConfig` (v3). Work in this order:

### 4a. Base tokens
File: `packages/lib/shared/services/chakra/themes/base/tokens.ts`
- Migrate the token structure to v3 format using the Chakra MCP server to understand the new token scale format.

### 4b. Semantic tokens
File: `packages/lib/shared/services/chakra/themes/base/semantic-tokens.ts`
- Migrate semantic token definitions to v3 format
- v3 uses `colorPalette` and CSS variable references differently
- The light/dark mode token format changed

### 4c. Component overrides
File: `packages/lib/shared/services/chakra/themes/base/components.ts` (34KB)
- This is the most complex file — migrate each component's `baseStyle`, `variants`, and `sizes`
- v3 uses `defineSlotRecipe` and `defineRecipe` instead of the v2 component style object API
- Consult the Chakra MCP server for each component's new recipe API

### 4d. Foundations
File: `packages/lib/shared/services/chakra/themes/base/foundations.ts`
- Migrate global styles, font config, and theme config to v3 equivalents

### 4e. App themes
Create a `createSystem` config for each app theme:
- `apps/frontend-v3/lib/services/chakra/themes/bal/bal.theme.ts`
- `apps/frontend-v3/lib/services/chakra/themes/cow/cow.theme.ts`
- `apps/beets-frontend-v3/lib/services/chakra/themes/beets/beets.theme.ts`
- Replace all `extendTheme(...)` calls with `createSystem(defineConfig(...))`

### 4f. Prose theme
File: `packages/lib/shared/services/chakra/themes/base/prose.ts`
- Check if `@nikolovlazar/chakra-ui-prose` has v3 support, otherwise rewrite

---

## Phase 5 — Provider & Color Mode Updates

### 5a. Update ChakraProvider in both apps
- `apps/frontend-v3/lib/services/chakra/ThemeProvider.tsx`
- `apps/beets-frontend-v3/lib/services/chakra/ThemeProvider.tsx`

In v3, `ChakraProvider` takes `value={system}` not `theme={theme}`. The theme-switching logic (bal vs cow based on `useCow()`) must be preserved — research the correct approach for runtime theme switching in v3 via the Chakra MCP server.

### 5b. Color mode integration with next-themes
- `apps/frontend-v3/app/layout.tsx`
- `apps/beets-frontend-v3/app/layout.tsx`

The app uses `next-themes` `ThemeProvider` for color mode. Look up the recommended way to integrate `next-themes` with Chakra v3 using the Chakra MCP server.

The `SetDarkTheme` component inside `apps/beets-frontend-v3/lib/services/chakra/ThemeProvider.tsx` calls `setColorMode` to force dark mode — this must continue to work.

### 5c. Color mode hook
File: `packages/lib/shared/services/chakra/useThemeColorMode.ts`
- This hook wraps `next-themes` only. Verify it still works with v3 or update as needed.

---

## Phase 6 — Component API Migration

Address changes the codemod may have missed:

### 6a. useColorMode / useColorModeValue (50 files / 16 files)
- Search for all `useColorMode` and `useColorModeValue` usages
- In v3 `useColorModeValue` may be renamed or replaced — verify via Chakra MCP server
- Update all call sites

### 6b. @chakra-ui/icons replacements (18 files)
- Find all imports from `@chakra-ui/icons`
- If the package is removed in v3, find the replacement icon strategy (Chakra v3 recommends specific icon libraries)
- Update all 18 files

### 6c. Removed sub-packages
Any code importing from these packages needs updating:
- `@chakra-ui/anatomy` — used in `packages/lib/shared/services/chakra/themes/base/components.ts`
- `@chakra-ui/clickable` — used in `packages/lib/shared/components/btns/ClickableText.tsx`
- `@chakra-ui/hooks` — used in several components

### 6d. framer-motion `as={motion.X}` pattern (24 files)
Pattern: `<Box as={motion.div} animate={...}>`

This is used heavily in:
- `packages/lib/modules/pool/PoolList/PoolListFilters.tsx` (15 usages)
- `packages/lib/shared/components/navs/NavBar.tsx` (9 usages)

Verify via the Chakra MCP server whether this pattern works in v3. If not, the fix is one of:
- Use the `chakra(motion.div)` factory to create a merged component
- Wrap framer-motion components directly and apply Chakra styles via the `css` prop or `className`

Apply the correct fix consistently across all 24 files.

### 6e. chakra-react-select
File: `packages/lib/shared/services/chakra/themes/base/custom/chakra-react-select.ts`
- Update the custom theme integration for the new version

### 6f. toastOptions on ChakraProvider
- v2: `<ChakraProvider toastOptions={{ defaultOptions: { position: 'bottom-left' } }}>`
- Verify the equivalent API in v3 and update both `ThemeProvider.tsx` files

---

## Phase 7 — TypeScript & Build Validation

### 7a. Postinstall scripts
Check if `chakra-cli tokens` postinstall scripts in `apps/frontend-v3/package.json` and `apps/beets-frontend-v3/package.json` still apply in v3, and update or remove them.

### 7b. TypeScript check
```bash
pnpm --filter lib tsc --noEmit
pnpm --filter frontend-v3 tsc --noEmit
pnpm --filter beets-frontend-v3 tsc --noEmit
```

Fix all TypeScript errors before proceeding.

### 7c. Dev build & visual check
```bash
pnpm --filter frontend-v3 dev
pnpm --filter beets-frontend-v3 dev
```

Verify:
- Light/dark mode toggle works correctly
- Theme switching (bal ↔ cow) works in `frontend-v3`
- Beets app stays in dark mode
- framer-motion animations still work (NavBar scroll animations, PoolList filter animations, modal transitions)
- All icon components render
- `chakra-react-select` dropdowns style correctly

---

## Phase 8 — Cleanup

- Remove any leftover v2-only imports or dead code
- Verify `pnpm-lock.yaml` has no duplicate Chakra versions
- Run `pnpm --filter lib build` to confirm the lib package builds cleanly
