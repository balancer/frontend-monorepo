import { CodegenConfig } from '@graphql-codegen/cli'

// App-local codegen for ormilabs subgraph schemas. We introspect against
// mainnet endpoints — all chains share the same schema per subgraph type, so
// any one chain's URL suffices as the schema source. Per-chain endpoint
// resolution happens at runtime in lib/services/subgraph/.
//
// The api-v3 codegen lives in @repo/lib (../../packages/lib/...). This file
// is for analytics-only subgraph types that the main app doesn't use.
//
// Add additional subgraph schemas (v2, gauges) under `generates` when widgets
// that consume them land. Keep schemas + queries colocated under
// lib/services/subgraph/<schema>/ so the document glob picks them up.

const ORMI_BASE =
  'https://api.subgraph.ormilabs.com/api/public/717cf785-de57-4761-94dd-9ac51b019902/subgraphs'

const config: CodegenConfig = {
  generates: {
    './lib/generated/v3-vault/': {
      schema: `${ORMI_BASE}/v3-vault-mainnet-smol/latest/gn`,
      documents: ['./lib/services/subgraph/v3-vault/**/*.graphql'],
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: {
        nonOptionalTypename: true,
        scalars: {
          BigInt: 'string',
          BigDecimal: 'string',
          Bytes: 'string',
        },
      },
    },
  },
}

export default config
