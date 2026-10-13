import { HttpResponse } from 'msw'
import { graphql } from 'msw/graphql'

export function GQLResponse(jsonResponse: object) {
  /*
    Casting to any until this typing issue is resolved:
    https://github.com/mswjs/msw/issues/2121
  */
  return HttpResponse.json({ data: jsonResponse }) as any
}

export const gqlApi = graphql.link('*')
