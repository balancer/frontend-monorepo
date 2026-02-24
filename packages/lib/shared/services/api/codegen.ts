import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_BALANCER_API_URL,
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
