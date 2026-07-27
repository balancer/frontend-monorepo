/* eslint-disable @typescript-eslint/no-unused-vars */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parse, type EnumTypeDefinitionNode } from 'graphql'
import * as enums from './graphql-enums'

describe('graphql-enums', () => {
  const schemaPath = join(__dirname, 'generated', 'schema.graphql')
  const schema = readFileSync(schemaPath, 'utf-8')
  const parsed = parse(schema)

  const schemaEnums = new Map<string, string[]>()
  for (const def of parsed.definitions) {
    if (def.kind === 'EnumTypeDefinition' && def.name) {
      const values = (def.values || []).map(v => v.name.value).filter(Boolean)
      schemaEnums.set(def.name.value, values)
    }
  }

  const exportedValues = Object.entries(enums)
    .filter(([key]) => key.endsWith('Values'))
    .map(([key, obj]) => ({
      name: key,
      enumName: key.replace('Values', ''),
      values: Object.values(obj as Record<string, string>),
    }))

  it('every exported const object matches the schema enum exactly', () => {
    // Deprecated values that are kept in the schema but intentionally removed from the UI.
    const deprecatedValuesByEnum: Record<string, string[]> = {
      GqlChain: ['ZKEVM'],
    }

    for (const exported of exportedValues) {
      const schemaValues = schemaEnums.get(exported.enumName)
      expect(schemaValues, `schema should define ${exported.enumName}`).toBeDefined()

      const deprecatedValues = deprecatedValuesByEnum[exported.enumName] || []
      const sortedExported = [...exported.values].sort()
      const sortedSchema = [...schemaValues!.filter(v => !deprecatedValues.includes(v))].sort()

      expect(sortedExported, `${exported.name} values mismatch`).toEqual(sortedSchema)
    }
  })

  it('warns if schema has Gql* enums missing from the const objects', () => {
    const exportedEnumNames = new Set(exportedValues.map(e => e.enumName))
    const missing: string[] = []
    for (const [enumName] of schemaEnums) {
      if (enumName.startsWith('Gql') && !exportedEnumNames.has(enumName)) {
        missing.push(enumName)
      }
    }
    // This is informational — not all schema enums need runtime objects.
    // Change to an assertion if you want to enforce completeness.
    console.info('Schema enums without runtime const objects:', missing)
  })
})
