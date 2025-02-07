import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { HumanAmount, isSameAddress } from '@balancer/sdk'
import { Address } from 'viem'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { VStack } from '@chakra-ui/react'
import { usePool } from '../../../PoolProvider'
import { hasNoLiquidity, shouldShowNativeWrappedSelector } from '../../LiquidityActionHelpers'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { Pool } from '../../../pool.types'
import { shouldUseUnderlyingToken } from '../../../pool-tokens.utils'

type Props = {
  /*
    Optional callback to override the default setAmountIn function (i.e. from TokenInputsAddable)
    Default scenario: only updates one token input
    Proportional scenario: updates all the inputs using proportional amount calculations
   */
  customSetAmountIn?: (token: ApiToken, humanAmount: HumanAmount) => void

  onToggleTokenClicked: (token: ApiToken) => void
}
export function TokenInputs({ onToggleTokenClicked, customSetAmountIn }: Props) {
  const { pool } = usePool()
  const { tokens, humanAmountsIn, setHumanAmountIn } = useAddLiquidity()

  const setAmountIn = customSetAmountIn || setHumanAmountIn

  function currentValueFor(tokenAddress: Address) {
    const amountIn = humanAmountsIn.find(amountIn =>
      isSameAddress(amountIn.tokenAddress, tokenAddress)
    )
    return amountIn ? amountIn.humanAmount : ''
  }

  function weightFor(tokenAddress: string) {
    return (
      tokens.find(token => isSameAddress(token.address as Address, tokenAddress as Address))
        ?.weight ?? undefined
    )
  }

  function shouldShowToggle(token: ApiToken, pool: Pool) {
    if (shouldShowNativeWrappedSelector(token, pool)) return true
    // TODO: Will be enabled in incoming PRs
    // if (shouldUseUnderlyingToken(token, pool)) return true
    return false
  }

  return (
    <VStack spacing="md" w="full">
      {tokens.map(token => {
        if (!token) return <div key="missing-token">Missing token</div>

        return (
          <TokenInput
            address={token.address}
            apiToken={token}
            chain={token.chain}
            isDisabled={hasNoLiquidity(pool)}
            key={token.address}
            onChange={e => setAmountIn(token, e.currentTarget.value as HumanAmount)}
            onToggleTokenClicked={onToggleTokenClicked}
            shouldShowToggle={shouldShowToggle(token, pool)}
            value={currentValueFor(token.address as Address)}
            weight={weightFor(token.address)}
          />
        )
      })}
    </VStack>
  )
}
