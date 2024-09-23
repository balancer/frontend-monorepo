/* eslint-disable @typescript-eslint/no-empty-function */
import { http } from 'msw'

export const defaultPostMswHandlers = [
  http.post('http://127.0.0.1:8*/*', () => {}),
  http.get('/', () => {}),
]
