import baseConfig from './base.js'
import nextJsConfig from './next.js'
import reactInternalConfig from './react-internals.js'

/**
 * Main ESLint configuration file that exports all configurations
 * for use in different parts of the monorepo.
 *
 * @type {import("eslint").Linter.Config}
 */
export { baseConfig, nextJsConfig, reactInternalConfig }

// Default export for direct usage
export default nextJsConfig
