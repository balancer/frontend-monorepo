import { useReClammInitAmounts } from './useReClammInitAmounts'
import { PoolCreationToken, SupportedPoolTypes } from '../../types'
import { useEffect, useRef } from 'react'
import { formatUnits } from 'viem'
import { useGyroEclpInitAmountsRatio } from './useGyroEclpInitAmountsRatio'
import { isReClammPool, isGyroEllipticPool } from '../../helpers'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useWatch } from 'react-hook-form'
import { VStack, Text } from '@chakra-ui/react'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { validatePoolTokens } from '../../validatePoolCreationForm'

interface TokenAmountInputProps {
  token: PoolCreationToken
  idx: number
  poolType: SupportedPoolTypes
  poolTokens: PoolCreationToken[]
}

export function SeedAmountInput({ token, idx, poolType, poolTokens }: TokenAmountInputProps) {
  const { updatePoolToken, poolAddress, poolCreationForm } = usePoolCreationForm()
  const [network] = useWatch({ control: poolCreationForm.control, name: ['network'] })
  const { reClammInitAmounts } = useReClammInitAmounts(isReClammPool(poolType), poolAddress, token)
  const eclpInitAmountsRatio = useGyroEclpInitAmountsRatio()

  const { setValidationError } = useTokenInputsValidation()

  const lastUserUpdatedAmountIdx = useRef<number | null>(null)

  const otherTokenInputIdx = idx === 0 ? 1 : 0
  const otherToken = poolTokens[otherTokenInputIdx]

  useEffect(() => {
    const amountErrorMsg = validatePoolTokens.hasAmountError(token, poolType)
    if (amountErrorMsg && token.address) setValidationError(token.address, amountErrorMsg)
  }, [token, poolType, setValidationError])

  const handleAmountChange = (idx: number, amount: string) => {
    lastUserUpdatedAmountIdx.current = idx

    if (isGyroEllipticPool(poolType) && eclpInitAmountsRatio) {
      const referenceAmount = Number(amount)

      if (!poolTokens[1]?.address || !poolTokens[0]?.address) return

      const areTokensInOrder =
        poolTokens[0].address.toLowerCase() < poolTokens[1].address.toLowerCase()

      const isReferenceAmountForTokenA = areTokensInOrder ? idx === 0 : idx === 1

      // must consider both the token order and which token is being updated by user
      const otherTokenAmount =
        isReferenceAmountForTokenA === areTokensInOrder
          ? referenceAmount / eclpInitAmountsRatio
          : referenceAmount * eclpInitAmountsRatio

      updatePoolToken(otherTokenInputIdx, { amount: otherTokenAmount.toString() })
    }

    updatePoolToken(idx, { amount })
  }

  // autofill other token amount for ReClamm using response from contract
  useEffect(() => {
    if (!reClammInitAmounts || lastUserUpdatedAmountIdx.current !== idx) return

    if (!otherToken?.address || !otherToken?.data?.decimals) return

    // Use sorted token addresses to find the index of the other tokenAmount in the sorted array
    const sortedAddresses = poolTokens
      .map(t => t.address?.toLowerCase())
      .filter(Boolean)
      .sort((a, b) => a!.localeCompare(b!))
    const otherTokenAmountIdx = sortedAddresses.indexOf(otherToken.address.toLowerCase())

    // Update the other token's amount using the corresponding value from initAmounts
    const otherTokenAmount = formatUnits(
      reClammInitAmounts[otherTokenAmountIdx],
      otherToken.data.decimals
    )
    updatePoolToken(otherTokenInputIdx, { amount: otherTokenAmount })
    lastUserUpdatedAmountIdx.current = null
  }, [idx, updatePoolToken, reClammInitAmounts, poolTokens])

  return (
    <VStack align="start" key={idx} spacing="sm" w="full">
      <Text fontWeight="bold">Token {idx + 1}</Text>
      <TokenInput
        apiToken={token.data}
        chain={network}
        customUsdPrice={Number(token.usdPrice)}
        onChange={e => handleAmountChange(idx, e.currentTarget.value)}
        value={token.amount}
      />
    </VStack>
  )
}
