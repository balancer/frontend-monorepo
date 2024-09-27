import { buildPoolListMswHandler } from './handlers/PoolList.handlers'
import { buildTokenPricesMswHandler } from './handlers/Tokens.handlers'
import { buildTokenListMswHandler } from './handlers/Tokens.handlers'
import { buildPoolMswHandler } from './handlers/Pool.handlers'
import { buildAppGlobalDataMswHandler } from './handlers/AppGlobalData.handlers'
import { defaultPostMswHandlers } from './handlers/rest-handlers'

/*
  Must be a function (not a plain const )to avoid circular import problems
*/
export const getDefaultMswHandlers = () => [
  ...defaultPostMswHandlers,
  buildPoolListMswHandler(),
  buildTokenListMswHandler(),
  buildTokenPricesMswHandler(),
  buildPoolMswHandler(),
  buildAppGlobalDataMswHandler(),
]
