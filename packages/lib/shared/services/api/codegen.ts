import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  generates: {
    ['./shared/services/api/generated/schema.graphql']: {
      schema: process.env.NEXT_PUBLIC_BALANCER_API_URL,
      plugins: ['schema-ast'],
    },
    [`./shared/services/api/generated/`]: {
      schema: process.env.NEXT_PUBLIC_BALANCER_API_URL,
      documents: ['./shared/services/api/**/*.graphql'],
      preset: 'client',
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
