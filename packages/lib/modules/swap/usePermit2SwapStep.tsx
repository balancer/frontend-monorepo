import { PublicWalletClient, SwapKind } from '@balancer/sdk'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { Address } from 'viem'
import { signPermit2Swap } from '../tokens/approvals/permit2/signPermit2Swap'
import { NoncesByTokenAddress } from '../tokens/approvals/permit2/usePermit2Allowance'
import { SignPermit2Fn, TokenAmountIn } from '../tokens/approvals/permit2/useSignPermit2'
import { useSignPermit2Step } from '../transactions/transaction-steps/useSignPermit2Step'
import {
  SdkSimulationResponseWithRouter,
  SwapSimulationQueryResult,
} from './queries/useSimulateSwapQuery'
import { ApiToken } from '../pool/pool.types'

type Props = {
  wethIsEth: boolean
  simulationQuery: SwapSimulationQueryResult
  tokenInInfo?: ApiToken
  chainId: number
  isPermit2: boolean
}

export function useSignPermit2SwapStep({
  chainId,
  wethIsEth,
  tokenInInfo,
  simulationQuery,
  isPermit2,
}: Props) {
  const { userAddress } = useUserAccount()
  const { slippage } = useUserSettings()

  const tokenInAddress = (tokenInInfo?.address ?? '') as Address

  const queryData = simulationQuery.data as SdkSimulationResponseWithRouter

  function getTokenInAmount(): bigint {
    if (!queryData?.queryOutput) return 0n
    if (queryData.queryOutput.swapKind === SwapKind.GivenIn) {
      return queryData.queryOutput.amountIn.amount
    }
    if (queryData.queryOutput.swapKind === SwapKind.GivenOut) {
      return queryData.queryOutput.expectedAmountIn.amount
    }
    return 0n
  }

  const tokenIn: TokenAmountIn | undefined = tokenInInfo
    ? {
        address: tokenInAddress,
        amount: getTokenInAmount(),
        symbol: tokenInInfo.symbol,
      }
    : undefined

  const signPermit2Fn: SignPermit2Fn = (
    sdkClient: PublicWalletClient,
    nonces: NoncesByTokenAddress
  ) => {
    return signPermit2Swap({
      sdkClient,
      wethIsEth,
      account: userAddress,
      queryOutput: queryData.queryOutput,
      slippagePercent: slippage,
      nonces,
      tokenIn,
    })
  }

  const swapRouter = queryData?.router

  return useSignPermit2Step({
    chainId,
    signPermit2Fn,
    wethIsEth,
    tokenAmountsIn: tokenIn ? [tokenIn] : undefined,
    isPermit2,
    isSimulationReady: !!swapRouter,
    spender: swapRouter || ('' as Address),
  })
}
