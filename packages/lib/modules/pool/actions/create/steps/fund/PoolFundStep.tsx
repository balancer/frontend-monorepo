import { Box, Heading, VStack, ListItem, UnorderedList, Text } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { PoolCreationRiskCheckboxes } from './PoolCreationRiskCheckboxes'
import { validatePoolTokens } from '../../validatePoolCreationForm'
import { SeedAmountProportions } from './SeedAmountProportions'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { useReClammSeedAmounts } from './useReClammSeedAmounts'
import { PoolCreationToken } from '../../types'
import { useEffect, useRef } from 'react'
import { formatUnits } from 'viem'

export function PoolFundStep() {
  const { isFormStateValid, poolTokens, poolAddress, poolCreationForm, isWeightedPool, isReClamm } =
    usePoolCreationForm()

  const { hasAcceptedTokenWeightsRisk, hasAcceptedPoolCreationRisk } = poolCreationForm.watch()
  const { hasValidationErrors } = useTokenInputsValidation()

  const isTokenAmountsValid =
    (validatePoolTokens.isValidTokenAmounts(poolTokens) && !hasValidationErrors) ||
    (isReClamm && !poolAddress)

  const hasAcceptedRisks = isWeightedPool
    ? hasAcceptedTokenWeightsRisk && hasAcceptedPoolCreationRisk
    : hasAcceptedPoolCreationRisk

  const isDisabled = !isFormStateValid || !hasAcceptedRisks || !isTokenAmountsValid

  const showTokenAmountInputs = !isReClamm || poolAddress

  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        <Heading color="font.maxContrast" size="md">
          Seed initial pool liquidity
        </Heading>

        <SeedPoolTips />

        {showTokenAmountInputs &&
          poolTokens.map((token, idx) => <TokenAmountInput idx={idx} key={idx} token={token} />)}

        {showTokenAmountInputs && <SeedAmountProportions displayAlert />}

        <PoolCreationRiskCheckboxes />

        <PoolCreationFormAction disabled={isDisabled} />
      </VStack>
    </Box>
  )
}

function TokenAmountInput({ token, idx }: { token: PoolCreationToken; idx: number }) {
  const { network, updatePoolToken, isReClamm, poolAddress, poolTokens } = usePoolCreationForm()
  const { initAmounts } = useReClammSeedAmounts(poolAddress, token)

  const lastUserUpdatedTokenIdx = useRef<number | null>(null)
  const handleAmountChange = (idx: number, amount: string) => {
    lastUserUpdatedTokenIdx.current = idx
    updatePoolToken(idx, { amount })
  }

  useEffect(() => {
    if (!isReClamm || !initAmounts || lastUserUpdatedTokenIdx.current !== idx) return

    const otherTokenIdx = idx === 0 ? 1 : 0
    const otherToken = poolTokens[otherTokenIdx]

    if (!otherToken?.address || !otherToken?.data?.decimals) {
      throw new Error('Token address or decimals missing for ReClamm seed amount computation')
    }

    // Create sorted token addresses to match the order of initAmounts from contract
    const sortedAddresses = poolTokens
      .map(t => t.address?.toLowerCase())
      .filter(Boolean)
      .sort((a, b) => a!.localeCompare(b!))

    // Find the index of the other token in the sorted array
    const otherTokenIndex = sortedAddresses.indexOf(otherToken.address.toLowerCase())

    // Update the other token's amount using the corresponding value from initAmounts
    const otherTokenAmount = formatUnits(initAmounts[otherTokenIndex], otherToken.data.decimals)
    updatePoolToken(otherTokenIdx, { amount: otherTokenAmount })
    lastUserUpdatedTokenIdx.current = null
  }, [isReClamm, idx, updatePoolToken, initAmounts, poolTokens])

  return (
    <VStack align="start" key={idx} spacing="sm" w="full">
      <Text>Token {idx + 1}</Text>
      <TokenInput
        address={token.address}
        chain={network}
        onChange={e => handleAmountChange(idx, e.currentTarget.value)}
        value={token.amount}
      />
    </VStack>
  )
}

function SeedPoolTips() {
  const { isReClamm, poolAddress } = usePoolCreationForm()

  const showReClammAlert = isReClamm && !poolAddress

  return (
    <>
      {showReClammAlert ? (
        <BalAlert
          content={
            <Text color="black">
              The ReClamm pool type requires you to deploy the pool contract before initial token
              amounts can be chosen.
            </Text>
          }
          status="info"
        />
      ) : (
        <BalAlert
          content={
            <UnorderedList>
              <ListItem color="black">Suggested seed amount: $5k+</ListItem>
              <ListItem color="black">
                The pool will be listed on the Balancer UI only once it is seeded.
              </ListItem>
              <ListItem color="black">
                For safety on the Balancer UI, LPs are required to make proportional adds when the
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
      )}
    </>
  )
}
