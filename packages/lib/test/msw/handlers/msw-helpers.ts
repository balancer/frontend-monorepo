import { HttpResponse } from 'msw'

export function GQLResponse(jsonResponse: object) {
  /*
    Casting to any until this typing issue is resolved:
    https://github.com/mswjs/msw/issues/2121
  */
  return HttpResponse.json({ data: jsonResponse }) as any
}
