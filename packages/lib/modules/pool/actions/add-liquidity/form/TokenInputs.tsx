import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { HumanAmount, isSameAddress } from '@balancer/sdk'
import { Address } from 'viem'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { VStack } from '@chakra-ui/react'
import { usePool } from '../../../PoolProvider'
import { hasNoLiquidity, shouldShowNativeWrappedSelector } from '../../LiquidityActionHelpers'

type Props = {
  tokenSelectDisclosureOpen: () => void
  /*
    Optional callback to override the default setAmountIn function (i.e. from TokenInputsAddable)
    Default scenario: only updates one token input
    Proportional scenario: updates all the inputs using proportional amount calculations
   */
  customSetAmountIn?: (tokenAddress: Address, humanAmount: HumanAmount) => void
}
export function TokenInputs({ tokenSelectDisclosureOpen, customSetAmountIn }: Props) {
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
      pool.poolTokens.find(token =>
        isSameAddress(token.address as Address, tokenAddress as Address)
      )?.weight ?? undefined
    )
  }

  return (
    <VStack spacing="md" w="full">
      {tokens.map(token => {
        if (!token) return <div key="missing-token">Missing token</div>

        return (
          <TokenInput
            address={token.address}
            chain={token.chain}
            isDisabled={hasNoLiquidity(pool)}
            key={token.address}
            onChange={e =>
              setAmountIn(token.address as Address, e.currentTarget.value as HumanAmount)
            }
            toggleTokenSelect={
              shouldShowNativeWrappedSelector(token, pool) ? tokenSelectDisclosureOpen : undefined
            }
            value={currentValueFor(token.address as Address)}
            weight={weightFor(token.address)}
          />
        )
      })}
    </VStack>
  )
}
