import { DocumentNode, TypedDocumentNode } from '@apollo/client'
import { RequestHandler } from 'msw'
import { mswServer } from './server'

/**
 *  Used by MSW handlers to know the names of the queries to mock.
 *
 * @param document Document from generated graphql.ts.
 * @returns Name of the query to mock in MSW handler
 *
 * Examples: getQueryName(GetPoolDocument) returns 'GetPool'
 *           getQueryName(GetTokensDocument) returns 'GetTokens'
 *
 */
export function getQueryName(document: TypedDocumentNode | DocumentNode): string {
  interface Node {
    name: { value: string }
  }
  const definition = document.definitions[0] as Node
  if (!definition?.name?.value) {
    throw new Error(`Query name not found in ${definition}`)
  }
  return definition?.name?.value
}
export function mockGQL(handlers: Array<RequestHandler> | RequestHandler) {
  // Override default handlers with custom ones
  if (Array.isArray(handlers)) return mswServer.use(...handlers)
  mswServer.use(handlers)
}
