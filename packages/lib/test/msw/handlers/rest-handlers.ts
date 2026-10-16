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
  /*
    The test anvil forks listen on 127.0.0.1:8645..9145 (see @repo/test/anvil/anvil-setup).
    A chain RPC that leaks out of a unit test would open a real socket to one of those
    ports. On CI that connection is refused during teardown and @mswjs/interceptors then
    aborts the socket, crashing the vitest worker with
    "Assertion failed: !wrap->started_" (SIGABRT) and failing the whole run.
    Answering with a JSON-RPC error keeps the request local: no socket is ever opened.
  */
  http.post(/^http:\/\/127\.0\.0\.1:\d+\//, () => {
    return HttpResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32000, message: 'Local anvil RPC is not available in unit tests' },
    })
  }),
  http.get('/', () => {}),
]
