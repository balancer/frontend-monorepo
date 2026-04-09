import { VStack, Text } from '@chakra-ui/react'
import { getChainId } from '@repo/lib/config/app.config'
import { SaleStructureForm } from '@repo/lib/modules/lbp/lbp.types'
import { CustomToken } from '@repo/lib/modules/tokens/token.types'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { useUserBalance } from '@repo/lib/shared/hooks/useUserBalance'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Control, Controller } from 'react-hook-form'
import { formatUnits } from 'viem'
import { useLbpForm } from '../../LbpFormProvider'
import { isEmpty } from 'lodash'
import { bn } from '@repo/lib/shared/utils/numbers'

export function SaleTokenAmountInput({
  control,
  selectedChain,
  launchToken,
  launchTokenPriceUsd,
  title,
}: {
  control: Control<SaleStructureForm>
  selectedChain: GqlChain
  launchToken: CustomToken
  launchTokenPriceUsd?: string
  title: string
}) {
  const {
    saleStructureForm: { clearErrors },
  } = useLbpForm()
  const { balanceData, isLoading } = useUserBalance({
    chainId: getChainId(selectedChain),
    token: launchToken.address,
  })
  const hasNoBalance = isLoading ? false : !balanceData || balanceData.value === 0n

  const priceMessage = isEmpty(launchToken.symbol)
    ? 'No sale token available'
    : hasNoBalance
      ? `Your wallet has no ${launchToken.symbol}`
      : `Price: ${launchTokenPriceUsd || 'N/A'}`

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="sale-token-amount">
        {title}
      </Text>
      <Controller
        control={control}
        name="saleTokenAmount"
        render={({ field, fieldState }) => (
          <>
            <TokenInput
              address={launchToken.address}
              apiToken={launchToken}
              chain={selectedChain}
              customUserBalance={
                balanceData ? bn(formatUnits(balanceData.value, balanceData.decimals)) : undefined
              }
              id="sale-token-amount"
              onChange={e => {
                field.onChange(e.currentTarget.value)
                clearErrors('saleTokenAmount')
              }}
              priceMessage={priceMessage}
              value={field.value}
            />
            {fieldState.error && (
              <Text color="font.error" fontSize="sm" textAlign="start" w="full">
                {fieldState.error.message}
              </Text>
            )}
          </>
        )}
      />
    </VStack>
  )
}
