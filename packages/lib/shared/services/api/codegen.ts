import { CodegenConfig } from '@graphql-codegen/cli'

const schemaWithHeaders = {
  [process.env.NEXT_PUBLIC_BALANCER_API_URL as string]: {
    headers: {
      'Accept-Encoding': 'identity', // Prevent gzip-compressed responses that the schema loader can't decompress
    },
  },
}

const config: CodegenConfig = {
  schema: schemaWithHeaders,
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
