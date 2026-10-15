import { http, HttpResponse } from 'msw'

export const defaultPostMswHandlers = [
  // Handle happy-dom's CORS preflights locally instead of hitting the real network.
  http.options('*', () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': '*',
        'access-control-allow-headers': '*',
      },
    })
  }),
  http.post('http://127.0.0.1:8*/*', () => {}),
  http.get('/', () => {}),
]
