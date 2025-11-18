import { Box, Heading, VStack, ListItem, UnorderedList, Text } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { PoolCreationRiskCheckboxes } from './PoolCreationRiskCheckboxes'
import { validatePoolTokens } from '../../validatePoolCreationForm'
import { SeedAmountProportions } from './SeedAmountProportions'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { useReClammInitAmounts } from './useReClammInitAmounts'
import { PoolCreationToken } from '../../types'
import { useEffect, useRef } from 'react'
import { formatUnits } from 'viem'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { useGyroEclpInitAmountsRatio } from './useGyroEclpInitAmountsRatio'

export function PoolFundStep() {
  const { poolAddress, poolCreationForm, isWeightedPool, isReClamm } = usePoolCreationForm()
  const { hasAcceptedTokenWeightsRisk, hasAcceptedPoolCreationRisk, poolTokens } =
    poolCreationForm.watch()
  const { hasValidationErrors } = useTokenInputsValidation()

  const isTokenAmountsValid =
    (validatePoolTokens.isValidTokenAmounts(poolTokens) && !hasValidationErrors) ||
    (isReClamm && !poolAddress)

  const hasAcceptedRisks = isWeightedPool
    ? hasAcceptedTokenWeightsRisk && hasAcceptedPoolCreationRisk
    : hasAcceptedPoolCreationRisk

  const isDisabled =
    !poolCreationForm.formState.isValid || !hasAcceptedRisks || !isTokenAmountsValid
  const showTokenAmountInputs = !isReClamm || poolAddress

  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        <SeedPoolTypeAlert />

        <Heading color="font.maxContrast" size="md">
          Seed initial pool liquidity
        </Heading>

        {showTokenAmountInputs && (
          <>
            {poolTokens.map((token, idx) => (
              <TokenAmountInput idx={idx} key={idx} token={token} />
            ))}

            <SeedAmountProportions displayAlert />
          </>
        )}

        <PoolCreationRiskCheckboxes />

        <PoolCreationFormAction disabled={isDisabled} />
      </VStack>
    </Box>
  )
}

function TokenAmountInput({ token, idx }: { token: PoolCreationToken; idx: number }) {
  const { updatePoolToken, poolAddress, isGyroEclp, poolCreationForm } = usePoolCreationForm()
  const { network, poolTokens } = poolCreationForm.watch()
  const { reClammInitAmounts } = useReClammInitAmounts(poolAddress, token)
  const eclpInitAmountsRatio = useGyroEclpInitAmountsRatio()

  const lastUserUpdatedAmountIdx = useRef<number | null>(null)

  const otherTokenInputIdx = idx === 0 ? 1 : 0
  const otherToken = poolTokens[otherTokenInputIdx]

  const handleAmountChange = (idx: number, amount: string) => {
    lastUserUpdatedAmountIdx.current = idx

    if (isGyroEclp && eclpInitAmountsRatio) {
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
      <Text>Token {idx + 1}</Text>
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

function SeedPoolTypeAlert() {
  const { isReClamm, poolAddress, isGyroEclp } = usePoolCreationForm()
  const { projectName } = PROJECT_CONFIG

  if (isReClamm) {
    if (!poolAddress) {
      return (
        <BalAlert
          content="The ReClamm pool type requires you to deploy the pool contract before initial token amounts can be chosen."
          status="info"
        />
      )
    } else {
      return (
        <BalAlert
          content="As you enter an amount for one of the tokens, the other token's amount is calculated to set up the required price ratio for pool initialization."
          status="info"
        />
      )
    }
  }

  if (isGyroEclp) {
    return (
      <BalAlert
        content="Gyro ECLPs should be initialized with precise amounts according to the pool's configuration parameters."
        status="info"
      />
    )
  }

  return (
    <BalAlert
      content={
        <UnorderedList>
          <ListItem color="black">Suggested seed amount: $5k+</ListItem>
          <ListItem color="black">
            The pool will be listed on the {projectName} UI only once it is seeded.
          </ListItem>
          <ListItem color="black">
            For safety on the {projectName} UI, LPs are required to make proportional adds when the
            liquidity of the pool is less than $50k.
          </ListItem>
          <ListItem color="black">
            Be very careful that the USD values are proportional to the target token weights, or
            you’ll likely get rekt.{' '}
          </ListItem>
        </UnorderedList>
      }
      status="info"
    />
  )
}
