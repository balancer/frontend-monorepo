import { PublicWalletClient } from '@balancer/sdk'
import { signPermit2Add } from '@repo/lib/modules/tokens/approvals/permit2/signPermit2Add'
import { NoncesByTokenAddress } from '@repo/lib/modules/tokens/approvals/permit2/usePermit2Allowance'
import { SignPermit2Fn as SignPermit2Fn } from '@repo/lib/modules/tokens/approvals/permit2/useSignPermit2'
import { useSignPermit2Step } from '@repo/lib/modules/transactions/transaction-steps/useSignPermit2Step'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { SdkQueryAddLiquidityOutput } from './add-liquidity.types'
import { AddLiquiditySimulationQueryResult } from './queries/useAddLiquiditySimulationQuery'
import { requiresPermit2Approval } from '../../pool.helpers'
import { usePool } from '../../PoolProvider'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { toTokenAmountsIn } from '../LiquidityActionHelpers'
import { Address } from 'viem'

type Props = {
  wethIsEth: boolean
  simulationQuery: AddLiquiditySimulationQueryResult
  humanAmountsIn: HumanTokenAmountWithAddress[]
}

export function useSignPermit2AddStep({ wethIsEth, humanAmountsIn, simulationQuery }: Props) {
  const { userAddress } = useUserAccount()
  const { pool, chainId } = usePool()
  const { slippage } = useUserSettings()

  const isPermit2 = requiresPermit2Approval(pool)
  const queryOutput = simulationQuery.data as SdkQueryAddLiquidityOutput

  const signPermit2Fn: SignPermit2Fn = (
    sdkClient: PublicWalletClient,
    nonces: NoncesByTokenAddress
  ) => {
    return signPermit2Add({
      sdkClient,
      pool,
      humanAmountsIn,
      wethIsEth,
      account: userAddress,
      sdkQueryOutput: queryOutput?.sdkQueryOutput,
      slippagePercent: slippage,
      nonces,
    })
  }

  const signPermit2Step = useSignPermit2Step({
    chainId,
    signPermit2Fn,
    wethIsEth,
    tokenAmountsIn: toTokenAmountsIn(queryOutput?.sdkQueryOutput, pool),
    isPermit2,
    isSimulationReady: !!queryOutput?.sdkQueryOutput.bptOut.amount,
    spender: queryOutput?.sdkQueryOutput?.to || ('' as Address),
  })

  return signPermit2Step
}
