import { TokenInputsValidationProvider } from '../../../tokens/TokenInputsValidationProvider'
import { TokenBalancesProvider, useTokenBalances } from '../../../tokens/TokenBalancesProvider'
import { useLbpForm } from '../../LbpFormProvider'
import { useTokens } from '../../../tokens/TokensProvider'
import { TokenInput } from '../../../tokens/TokenInput/TokenInput'
import { isGreaterThanZeroValidation, bn } from '@repo/lib/shared/utils/numbers'
import { SaleStructureForm } from '../../lbp.types'
import { Control, Controller, useFormState, useWatch } from 'react-hook-form'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { VStack, Text, Heading, Alert, AlertIcon, AlertDescription } from '@chakra-ui/react'
import { AlertTriangle } from 'react-feather'
import { LightbulbIcon } from '@repo/lib/shared/components/icons/LightbulbIcon'
import { format, parseISO } from 'date-fns'
import { isSaleStartValid, saleStartsSoon } from './helpers'
import { SaleTokenAmountInput } from './SaleTokenAmountInput'
import { formatUnits } from 'viem'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'

export function DynamicLbpTokenAmountInputs() {
  const { getToken } = useTokens()
  const {
    launchToken,
    saleStructureForm: { control },
    isSeedless,
  } = useLbpForm()
  useFormState({ control })
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
              {`Sale token amount and ${isSeedless ? 'virtual' : ''} collateral balance`}
            </Heading>
            <Text color="font.secondary" fontSize="sm">
              The starting liquidity in the pool. The amounts and ratio will determine the starting
              price, projected market cap and price curve.
            </Text>

            {isSeedless && (
              <BalAlert
                content="Seedless LBP: Just the sale token, no collateral needed"
                status="info"
              />
            )}

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
          <VStack align="start" w="full">
            <SaleTokenAmountInput
              control={control}
              launchToken={launchToken}
              selectedChain={selectedChain}
              title="Sale token"
            />
            <Text color="font.secondary" fontSize="sm">
              This is the max amount of tokens that can be sold during the LBP
            </Text>
          </VStack>
          <CollateralTokenAmountInput
            collateralTokenAddress={collateralTokenAddress}
            collateralTokenSymbol={collateralToken?.symbol || ''}
            control={control}
            selectedChain={selectedChain}
          />
        </TokenBalancesProvider>
      )}
    </TokenInputsValidationProvider>
  )
}

function CollateralTokenAmountInput({
  control,
  selectedChain,
  collateralTokenAddress,
  collateralTokenSymbol,
}: {
  control: Control<SaleStructureForm>
  selectedChain: GqlChain
  collateralTokenAddress: string
  collateralTokenSymbol: string
}) {
  const {
    saleStructureForm: { clearErrors },
    isSeedless,
  } = useLbpForm()
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const balance = balanceFor(collateralTokenAddress)

  const haveEnoughAmount = (value: string) => {
    if (isBalancesLoading) return true

    if (!balance || balance.amount === 0n) {
      return `Your wallet has no ${collateralTokenSymbol}. You need some to seed this pool.\nSuggested seed liquidity amount: $5k+`
    }

    // TODO: do we need this? TokenInput alread has 'Exceeds balance'
    if (bn(formatUnits(balance.amount || 0n, balance.decimals || 0)).lt(value)) {
      return `Your wallet does not have enough ${collateralTokenSymbol}`
    }

    return true
  }

  return (
    <VStack align="start" data-group w="full">
      <Text as="label" color="font.primary" htmlFor="collateral-token-amount">
        {isSeedless ? 'Virtual paired token initial balance' : 'Collateral token'}
      </Text>
      <Controller
        control={control}
        name="collateralTokenAmount"
        render={({ field, fieldState }) => (
          <>
            <TokenInput
              address={collateralTokenAddress}
              chain={selectedChain}
              customUserBalance={isSeedless ? bn(Infinity) : undefined}
              disableBalanceValidation={isSeedless}
              id="collateral-token-amount"
              onChange={e => {
                field.onChange(e.currentTarget.value)
                clearErrors('collateralTokenAmount')
              }}
              value={field.value}
            />
            {fieldState.error && (
              <Text
                color="font.error"
                fontSize="sm"
                textAlign="start"
                w="full"
                whiteSpace="pre-wrap"
              >
                {fieldState.error.message}
              </Text>
            )}
          </>
        )}
        rules={{
          required: 'Collateral token amount is required',
          validate: { isGreaterThanZeroValidation, haveEnoughAmount },
        }}
      />
      <Text color="font.secondary" fontSize="sm">
        {isSeedless
          ? `The virtual paired token balance here is used to set initial price and potential
          sale token market cap. You don't need to add any of this.`
          : 'Add $5k+ of the collateral token to ensure a smooth start.'}
      </Text>
    </VStack>
  )
}
