/**
 * after the upgrade to nextjs 15 + eslint 9 importing from wagmi directly in the apps throws an error
 * "WagmiProviderNotFoundError: 'useConfig' must be used within 'WagmiProvider'"
 *
 * as a workaround this barrel file is used when the apps need to import from wagmi
 * if an import you need is missing, add it here
 */

import {
  useReadContracts,
  useReadContract,
  useBalance,
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
} from 'wagmi'

export {
  useReadContracts,
  useReadContract,
  useBalance,
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
}
