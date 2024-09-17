import { Context, useContext } from 'react'

/**
 * Throws an error if we try to use the context without a wrapping context provider
 * @param context React context created with createContext function
 * @param providedResourceName Name of the resource that we are providing (used to throw a proper error message).
 * Examples of providedResourceName:
 *    "Tokens" when using TokensProvider and useTokens
 *    "Pool" when using PoolProvider and usePool
 */
export function useMandatoryContext<T>(context: Context<T>, providedResourceName: string) {
  const cxt = useContext(context)
  if (!cxt) {
    throw new Error(
      `use${providedResourceName} must be used within a ${providedResourceName}Provider context`
    )
  }
  return cxt
}
