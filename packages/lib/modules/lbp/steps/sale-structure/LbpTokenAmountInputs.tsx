import { CustomToken } from '../../../tokens/token.types'
import { useUserBalance } from '@repo/lib/shared/hooks/useUserBalance'
import { TokenInputsValidationProvider } from '../../../tokens/TokenInputsValidationProvider'
import { TokenBalancesProvider, useTokenBalances } from '../../../tokens/TokenBalancesProvider'
import { useLbpForm } from '../../LbpFormProvider'
import { useTokens } from '../../../tokens/TokensProvider'
import { formatUnits } from 'viem'
import { getChainId } from '@repo/lib/config/app.config'
import { TokenInput } from '../../../tokens/TokenInput/TokenInput'
import { isGreaterThanZeroValidation, bn } from '@repo/lib/shared/utils/numbers'
import { SaleStructureForm } from '../../lbp.types'
import { Control, Controller, FieldErrors, useFormState, useWatch } from 'react-hook-form'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { VStack, Text, Heading, Alert, AlertIcon, AlertDescription } from '@chakra-ui/react'
import { AlertTriangle } from 'react-feather'
import { LightbulbIcon } from '@repo/lib/shared/components/icons/LightbulbIcon'
import { format, parseISO } from 'date-fns'
import { isSaleStartValid, saleStartsSoon } from './helpers'

export function LbpTokenAmountInputs() {
  const { getToken } = useTokens()
  const {
    launchToken,
    saleStructureForm: { control },
  } = useLbpForm()
  const { errors } = useFormState({ control })
  const [collateralTokenAddress, selectedChain, startDateTime] = useWatch({
    control,
    name: ['collateralTokenAddress', 'selectedChain', 'startDateTime'],
  })
  const collateralToken = getToken(collateralTokenAddress, selectedChain)
  const saleStart = startDateTime

  return (
    <TokenInputsValidationProvider>
      {collateralToken && (
        <TokenBalancesProvider extTokens={[collateralToken]}>
          <VStack align="start" spacing="md" w="full">
            <Heading color="font.maxContrast" size="md">
              Seed initial pool liquidity
            </Heading>
            <Text color="font.secondary" fontSize="sm">
              The initial seed amounts and their ratio set the starting price, projected market cap
              and price curve. The stats and charts in the preview show the impact of your choices.
            </Text>
            {saleStart && isSaleStartValid(saleStart) && (
              <Alert
                status={saleStartsSoon(saleStart) ? 'warning' : 'info'}
                variant="WideOnDesktop"
              >
                <AlertIcon as={saleStartsSoon(saleStart) ? AlertTriangle : LightbulbIcon} />
                <AlertDescription color="#000" fontSize="sm">
                  {saleStartsSoon(saleStart) && 'This sale is scheduled to start soon. '}
                  The LBP will fail to launch unless you seed the initial liquidity before the
                  scheduled start time at {format(parseISO(saleStart), 'h:mmaaa, d MMMM yyyy')}.
                </AlertDescription>
              </Alert>
            )}
          </VStack>
          <SaleTokenAmountInput
            control={control}
            errors={errors}
            launchToken={launchToken}
            selectedChain={selectedChain}
          />
          <CollateralTokenAmountInput
            collateralTokenAddress={collateralTokenAddress}
            collateralTokenSymbol={collateralToken?.symbol || ''}
            control={control}
            errors={errors}
            selectedChain={selectedChain}
          />
        </TokenBalancesProvider>
      )}
    </TokenInputsValidationProvider>
  )
}

function SaleTokenAmountInput({
  control,
  errors,
  selectedChain,
  launchToken,
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  selectedChain: GqlChain
  launchToken: CustomToken
}) {
  const { balanceData, isLoading } = useUserBalance({
    chainId: getChainId(selectedChain),
    token: launchToken.address,
  })

  const haveEnoughAmount = (value: string) => {
    if (isLoading) return true

    if (!balanceData || balanceData.value === 0n) {
      return `Your wallet has no ${launchToken.symbol}. You will need some to seed this pool and sell it during the LBP`
    }

    if (bn(balanceData.value).shiftedBy(balanceData.decimals).lt(value)) {
      return `Your wallet does not have enough ${launchToken.symbol}`
    }

    return true
  }

  return (
    <VStack align="start" data-group w="full">
      <Text as="label" color="font.primary" htmlFor="sale-token-amount">
        Sale token
      </Text>
      <Controller
        control={control}
        name="saleTokenAmount"
        render={({ field }) => (
          <TokenInput
            address={launchToken.address}
            apiToken={launchToken}
            chain={selectedChain}
            customUserBalance={formatUnits(balanceData?.value || 0n, launchToken.decimals)}
            id="sale-token-amount"
            onChange={e => field.onChange(e.currentTarget.value)}
            priceMessage="Price: N/A"
            value={field.value}
          />
        )}
        rules={{
          required: 'Sale token amount is required',
          validate: { isGreaterThanZeroValidation, haveEnoughAmount },
        }}
      />
      <Text
        _groupFocusWithin={{ opacity: '1' }}
        _groupHover={{ opacity: '1' }}
        fontSize="sm"
        opacity="0.5"
        pt="xs"
        transition="opacity 0.2s var(--ease-out-cubic)"
        variant="secondary"
      >
        This is the max amount of tokens that can be sold during the LBP
      </Text>
      {errors.saleTokenAmount && (
        <Text color="font.error" fontSize="sm" textAlign="start" w="full">
          {errors.saleTokenAmount.message}
        </Text>
      )}
    </VStack>
  )
}

function CollateralTokenAmountInput({
  control,
  errors,
  selectedChain,
  collateralTokenAddress,
  collateralTokenSymbol,
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  selectedChain: GqlChain
  collateralTokenAddress: string
  collateralTokenSymbol: string
}) {
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const balance = balanceFor(collateralTokenAddress)

  const haveEnoughAmount = (value: string) => {
    if (isBalancesLoading) return true

    if (!balance || balance.amount === 0n) {
      return `Your wallet has no ${collateralTokenSymbol}. You need some to seed this pool.\nSuggested seed liquidity amount: $5k+`
    }

    if (bn(balance.amount).shiftedBy(balance.decimals).lt(value)) {
      return `Your wallet does not have enough ${collateralTokenSymbol}`
    }

    return true
  }

  return (
    <VStack align="start" data-group w="full">
      <Text as="label" color="font.primary" htmlFor="collateral-token-amount">
        Collateral token
      </Text>
      <Controller
        control={control}
        name="collateralTokenAmount"
        render={({ field }) => (
          <TokenInput
            address={collateralTokenAddress}
            chain={selectedChain}
            id="collateral-token-amount"
            onChange={e => field.onChange(e.currentTarget.value)}
            value={field.value}
          />
        )}
        rules={{
          required: 'Collateral token amount is required',
          validate: { isGreaterThanZeroValidation, haveEnoughAmount },
        }}
      />
      <Text
        _groupFocusWithin={{ opacity: '1' }}
        _groupHover={{ opacity: '1' }}
        fontSize="sm"
        opacity="0.5"
        pt="xs"
        transition="opacity 0.2s var(--ease-out-cubic)"
        variant="secondary"
      >
        Add $5k+ of the collateral token to ensure a smooth start.
      </Text>
      {errors.collateralTokenAmount && (
        <Text color="font.error" fontSize="sm" textAlign="start" w="full" whiteSpace="pre-wrap">
          {errors.collateralTokenAmount.message}
        </Text>
      )}
    </VStack>
  )
}
