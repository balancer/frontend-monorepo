import { VStack, Text } from '@chakra-ui/react'
import { getChainId } from '@repo/lib/config/app.config'
import { SaleStructureForm } from '@repo/lib/modules/lbp/lbp.types'
import { CustomToken } from '@repo/lib/modules/tokens/token.types'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { useUserBalance } from '@repo/lib/shared/hooks/useUserBalance'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { bn, isGreaterThanZeroValidation } from '@repo/lib/shared/utils/numbers'
import { Control, FieldErrors, Controller, useFormState } from 'react-hook-form'
import { formatUnits } from 'viem'

export function SaleTokenAmountInput({
  control,
  errors,
  selectedChain,
  launchToken,
  launchTokenPriceUsd,
  title,
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  selectedChain: GqlChain
  launchToken: CustomToken
  launchTokenPriceUsd?: string
  title: string
}) {
  const { balanceData, isLoading } = useUserBalance({
    chainId: getChainId(selectedChain),
    token: launchToken.address,
  })
  const { errors: formErrors } = useFormState({ control, name: ['saleTokenAmount'] })
  const saleTokenError = errors.saleTokenAmount || formErrors.saleTokenAmount

  const haveEnoughAmount = (value: string) => {
    if (isLoading) return true

    if (!balanceData || balanceData.value === 0n) {
      return `Your wallet has no ${launchToken.symbol}. You will need some to seed this pool and sell it during the LBP`
    }

    // TODO: do we need this? TokenInput alread has 'Exceeds balance'
    if (bn(formatUnits(balanceData.value, balanceData.decimals)).lt(value)) {
      return `Your wallet does not have enough ${launchToken.symbol}`
    }

    return true
  }

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="sale-token-amount">
        {title}
      </Text>
      <Controller
        control={control}
        name="saleTokenAmount"
        render={({ field }) => (
          <TokenInput
            address={launchToken.address}
            apiToken={launchToken}
            chain={selectedChain}
            customUserBalance={
              balanceData ? formatUnits(balanceData.value, balanceData.decimals) : undefined
            }
            id="sale-token-amount"
            onChange={e => field.onChange(e.currentTarget.value)}
            priceMessage={`Price: ${launchTokenPriceUsd || 'N/A'}`}
            value={field.value}
          />
        )}
        rules={{
          required: 'Sale token amount is required',
          validate: { isGreaterThanZeroValidation, haveEnoughAmount },
        }}
      />
      {saleTokenError && (
        <Text color="font.error" fontSize="sm" textAlign="start" w="full">
          {saleTokenError.message}
        </Text>
      )}
    </VStack>
  )
}
