import { TokenInputsValidationProvider } from '../../../tokens/TokenInputsValidationProvider'
import { InputGroup, Input, InputRightElement, Button, Box } from '@chakra-ui/react'
import { TokenBalancesProvider } from '../../../tokens/TokenBalancesProvider'
import { useLbpForm } from '../../LbpFormProvider'
import { useTokens } from '../../../tokens/TokensProvider'
import { bn, isGreaterThanZeroValidation } from '@repo/lib/shared/utils/numbers'
import { SaleStructureForm } from '../../lbp.types'
import { Control, Controller, FieldErrors, useFormState, useWatch } from 'react-hook-form'
import { VStack, Text, Heading } from '@chakra-ui/react'
import { SaleTokenAmountInput } from './SaleTokenAmountInput'

export function FixedLbpTokenAmountInputs() {
  const { getToken } = useTokens()

  const {
    launchToken,
    launchTokenPriceRaw,
    launchTokenPriceUsd,
    totalValueUsd,
    totalValueRaw,
    poolAddress,
    saleStructureForm: { control },
  } = useLbpForm()

  const { errors } = useFormState({ control })

  const [collateralTokenAddress, selectedChain] = useWatch({
    control,
    name: ['collateralTokenAddress', 'selectedChain'],
  })

  const collateralToken = getToken(collateralTokenAddress, selectedChain)

  const launchTokenSymbol = launchToken.symbol
  const collateralTokenSymbol = collateralToken?.symbol || ''

  const balanceTokens = [collateralToken, launchToken].filter(
    (token): token is NonNullable<typeof token> => Boolean(token)
  )

  return (
    <TokenInputsValidationProvider>
      {collateralToken && (
        <TokenBalancesProvider extTokens={balanceTokens}>
          <VStack align="start" spacing="md" w="full">
            <Heading color="font.maxContrast" size="md">
              Sale configuration
            </Heading>
            <LaunchTokenRateInput
              collateralTokenSymbol={collateralTokenSymbol}
              control={control}
              errors={errors}
              isDisabled={!!poolAddress}
              launchTokenPriceRaw={launchTokenPriceRaw}
              launchTokenPriceUsd={launchTokenPriceUsd}
              launchTokenSymbol={launchTokenSymbol}
            />
            <VStack align="start" w="full">
              <SaleTokenAmountInput
                control={control}
                launchToken={launchToken}
                launchTokenPriceUsd={launchTokenPriceUsd}
                selectedChain={selectedChain}
                title="How many tokens do you want to sell in this sale?"
              />
              <Text color="font.secondary" fontSize="sm">
                Transfer all of the tokens to be sold in the token sale right now.
              </Text>
              <Text
                color={bn(totalValueRaw).gt(0) ? 'font.secondary' : 'font.secondaryAlpha50'}
                fontSize="sm"
              >
                At current prices, if all tokens are sold, you will raise: ~{totalValueUsd}
              </Text>
            </VStack>
          </VStack>
        </TokenBalancesProvider>
      )}
    </TokenInputsValidationProvider>
  )
}

function LaunchTokenRateInput({
  control,
  errors,
  isDisabled,
  collateralTokenSymbol,
  launchTokenSymbol,
  launchTokenPriceUsd,
  launchTokenPriceRaw,
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  isDisabled: boolean
  collateralTokenSymbol: string
  launchTokenSymbol: string
  launchTokenPriceUsd: string
  launchTokenPriceRaw: string
}) {
  const { errors: formErrors } = useFormState({ control, name: ['launchTokenRate'] })
  const launchTokenRateError = errors.launchTokenRate || formErrors.launchTokenRate

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="launch-token-price">
        {launchTokenSymbol} token sale price (against {collateralTokenSymbol})
      </Text>
      <Controller
        control={control}
        name="launchTokenRate"
        render={({ field }) => (
          <Box
            _focusWithin={{
              boxShadow: 'input.innerFocus',
            }}
            bg="background.level0"
            border="white"
            borderRadius="md"
            p={['ms', 'md']}
            position="relative"
            shadow="innerBase"
            w="full"
          >
            <InputGroup background="transparent" border="transparent">
              <Input
                _focus={{
                  outline: 'none',
                  border: '0px solid transparent',
                  boxShadow: 'none',
                }}
                _hover={{
                  border: '0px solid transparent',
                  boxShadow: 'none',
                }}
                autoComplete="off"
                autoCorrect="off"
                bg="transparent"
                border="0px solid transparent"
                boxShadow="none"
                fontSize="3xl"
                fontWeight="medium"
                id="launch-token-price"
                isDisabled={isDisabled}
                min={0}
                onChange={field.onChange}
                onWheel={e => {
                  // Avoid changing the input value when scrolling
                  return e.currentTarget.blur()
                }}
                outline="none"
                p="0"
                placeholder="0.00"
                shadow="none"
                step="any"
                type="number"
                value={field.value}
              />
              <InputRightElement w="max-content">
                <Button
                  aria-label="token-pair"
                  cursor="default"
                  p="2"
                  pointerEvents="none"
                  variant="tertiary"
                >
                  {launchTokenSymbol} / {collateralTokenSymbol}
                </Button>
              </InputRightElement>
            </InputGroup>
          </Box>
        )}
        rules={{
          required: 'Token sale price is required',
          validate: { isGreaterThanZeroValidation },
        }}
      />
      {launchTokenRateError && (
        <Text color="font.error" fontSize="sm" textAlign="start" w="full" whiteSpace="pre-wrap">
          {launchTokenRateError.message}
        </Text>
      )}
      <Text color="font.secondary" fontSize="sm">
        {`At current prices, 1 ${launchTokenSymbol} will be sold for${bn(launchTokenPriceRaw).gt(0) ? ` ${launchTokenPriceUsd}` : '...'}`}
      </Text>
    </VStack>
  )
}
