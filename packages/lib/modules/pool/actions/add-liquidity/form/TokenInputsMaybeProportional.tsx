/* eslint-disable max-len */
import { VStack } from '@chakra-ui/react'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { TokenInputs } from './TokenInputs'
import { useProportionalInputs } from './useProportionalInputs'

type Props = {
  tokenSelectDisclosureOpen: () => void
  isProportional: boolean
  totalUSDValue: string
}

export function TokenInputsMaybeProportional({ tokenSelectDisclosureOpen, isProportional }: Props) {
  const { setHumanAmountIn } = useAddLiquidity()

  const { handleProportionalHumanInputChange } = useProportionalInputs()

  const setAmountIn = isProportional ? handleProportionalHumanInputChange : setHumanAmountIn

  return (
    <VStack spacing="md" w="full">
      {/* TODO: show missing alerts here? */}
      <TokenInputs
        customSetAmountIn={setAmountIn}
        tokenSelectDisclosureOpen={tokenSelectDisclosureOpen}
      />
    </VStack>
  )
}
