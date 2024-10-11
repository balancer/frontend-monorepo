/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getGqlChain, getNetworkConfig } from '@/lib/config/app.config'
import { permit2Abi } from '@balancer/sdk'
import { zipObject } from 'lodash'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export type NoncesByTokenAddress = Record<Address, number>
export type ExpirationByTokenAddress = Record<Address, number>
export type AllowedAmountsByTokenAddress = Record<Address, bigint>

export type Permit2AllowanceResult = ReturnType<typeof usePermit2Allowance>

type Params = {
  chainId: number
  tokenAddresses?: Address[]
  owner?: Address
  enabled: boolean
}
export function usePermit2Allowance({ chainId, tokenAddresses, owner, enabled }: Params) {
  const networkConfig = getNetworkConfig(getGqlChain(chainId))
  const permit2Address = networkConfig.contracts.permit2!
  const balancerRouter = networkConfig.contracts.balancer.router!
  const spender = balancerRouter

  const contracts = tokenAddresses?.map(
    tokenAddress =>
      ({
        chainId,
        address: permit2Address,
        abi: permit2Abi,
        functionName: 'allowance',
        args: [owner, tokenAddress, spender],
      } as const)
  )

  const { data, isLoading } = useReadContracts({
    contracts,
    allowFailure: false,
    query: {
      enabled: enabled && tokenAddresses && tokenAddresses.length > 0 && !!owner,
    },
  })

  const nonces: NoncesByTokenAddress | undefined =
    tokenAddresses && data
      ? zipObject(
          tokenAddresses,
          data.map(result => result[2])
        )
      : undefined

  const expirations: ExpirationByTokenAddress | undefined =
    tokenAddresses && data
      ? zipObject(
          tokenAddresses,
          data.map(result => result[1])
        )
      : undefined

  const allowedAmounts: AllowedAmountsByTokenAddress | undefined =
    tokenAddresses && data
      ? zipObject(
          tokenAddresses,
          data.map(result => result[0])
        )
      : undefined

  return {
    isLoadingPermit2Allowances: isLoading,
    nonces,
    expirations,
    allowedAmounts,
  }
}
