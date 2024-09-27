import { HttpResponse } from 'msw'

export function GQLResponse(jsonResponse: object) {
  return HttpResponse.json({ data: jsonResponse })
}
