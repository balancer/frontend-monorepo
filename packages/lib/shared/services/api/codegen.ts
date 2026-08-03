import { CodegenConfig } from '@graphql-codegen/cli'
import { createRequire } from 'module'
import { resolve } from 'path'

// pnpm + ESM workaround: @graphql-codegen/cli's default loader does a bare
// `import(mod)` that Node resolves from the CLI's own location inside the pnpm
// store, where project-only plugins (e.g. schema-ast) are not installed,
// resulting in "Unable to find template plugin matching 'schema-ast'".
// Resolve plugin paths from this package's directory instead.
const requireFromHere = createRequire(resolve(__dirname, '__fake.js'))
const pluginLoader = async (name: string) => import(requireFromHere.resolve(name))

const config: CodegenConfig = {
  schema: {
    [process.env.NEXT_PUBLIC_BALANCER_API_URL as string]: {
      headers: {
        'Accept-Encoding': 'identity', // Prevent gzip-compressed responses that the schema loader can't decompress
      },
    },
  },
  pluginLoader,
  generates: {
    ['./shared/services/api/generated/schema.graphql']: {
      plugins: ['schema-ast'],
    },
    [`./shared/services/api/generated/`]: {
      documents: ['./shared/services/api/**/*.graphql'],
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        nonOptionalTypename: true,
        scalars: {
          BigInt: 'string',
          BigDecimal: 'string',
          Bytes: 'string',
          AmountHumanReadable: 'string',
          GqlBigNumber: 'string',
        },
      },
    },
  },
}

export default config
