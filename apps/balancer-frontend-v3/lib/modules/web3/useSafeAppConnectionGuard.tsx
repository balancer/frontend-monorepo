/* eslint-disable react-hooks/exhaustive-deps */
import { Connector, useConnect } from 'wagmi'
import { useEffect } from 'react'

/*
  If the app is running as a Safe App and an EOA connection is created in another tab,
  this hook will ensure that the Safe App tab keeps connected to the Safe account.
*/
export function useSafeAppConnectionGuard(newConnector?: Connector, chainId?: number) {
  const { connect, connectors } = useConnect()
  useEffect(() => {
    const safeConnector = connectors.find(c => c.id === 'safe')
    if (isSafeApp() && newConnector && newConnector?.id !== 'safe' && safeConnector) {
      connect({ chainId, connector: safeConnector })
    }
  }, [newConnector])
}

/*
  There are some edge-cases where the `window.location.ancestorOrigins` is not available.
  We ignore the errors so the guard will not work in those edge-cases.
 */
function isSafeApp() {
  try {
    return window.location.ancestorOrigins[0] === 'https://app.safe.global'
  } catch (e) {
    return false
  }
}
