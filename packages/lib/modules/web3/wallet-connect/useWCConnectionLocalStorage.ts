import { useLocalStorage } from 'usehooks-ts'

const WC_CONNECTED_KEY = 'balancer-wc-connected'

/*
  Saves wallet connect (WC) connection status in local storage
  Required to avoid creating a new WC session on every page reload
  (Rainbowkit + wagmi related bug)
*/
export function useWCConnectionLocalStorage() {
  const [isConnectedToWC, setIsConnectedToWC] = useLocalStorage(WC_CONNECTED_KEY, true)
  return {
    isConnectedToWC,
    setIsConnectedToWC,
  }
}

// We cannot use hooks in wagmiConfig because it is a plain ts file
export function isConnectedToWC() {
  if (typeof localStorage === 'undefined') return false

  return localStorage?.getItem(WC_CONNECTED_KEY) === 'true'
}
