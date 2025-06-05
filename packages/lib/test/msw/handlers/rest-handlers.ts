import { http } from 'msw'

export const defaultPostMswHandlers = [
  http.post('http://127.0.0.1:8*/*', () => {}),
  http.get('/', () => {}),
]
