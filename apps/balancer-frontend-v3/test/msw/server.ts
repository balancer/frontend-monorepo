import { setupServer } from 'msw/node'
import { getDefaultMswHandlers } from './default-handlers'

export const mswServer = setupServer(...getDefaultMswHandlers())
