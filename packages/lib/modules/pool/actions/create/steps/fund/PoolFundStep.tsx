import { Box, Heading, VStack, ListItem, UnorderedList, Text } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { PoolCreationRiskCheckboxes } from './PoolCreationRiskCheckboxes'
import { validatePoolTokens, validatePoolType } from '../../validatePoolCreationForm'
import { PoolTokenWeightsCard } from './PoolTokenWeightsCard'

export function PoolFundStep() {
  const { isFormStateValid, poolTokens, network, updatePoolToken, poolCreationForm, poolType } =
    usePoolCreationForm()
  const { hasAcceptedTokenWeightsRisk, hasAcceptedPoolCreationRisk } = poolCreationForm.watch()

  const isWeightedPool = validatePoolType.isWeightedPool(poolType)

  const isTokenAmountsValid = validatePoolTokens.isValidTokenAmounts(poolTokens)

  const hasAcceptedRisks = isWeightedPool
    ? hasAcceptedTokenWeightsRisk && hasAcceptedPoolCreationRisk
    : hasAcceptedPoolCreationRisk

  const isDisabled = !isFormStateValid || !isTokenAmountsValid || !hasAcceptedRisks

  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        <Heading color="font.maxContrast" size="md">
          Seed initial pool liquidity
        </Heading>
        <InitializePoolTips />
        {poolTokens.map((token, idx) => {
          return (
            <VStack align="start" key={idx} spacing="sm" w="full">
              <Text>Token {idx + 1}</Text>
              <TokenInput
                address={token.address}
                chain={network}
                onChange={e => updatePoolToken(idx, { amount: e.currentTarget.value })}
                value={poolTokens[idx].amount}
              />
            </VStack>
          )
        })}
        {isWeightedPool && <PoolTokenWeightsCard />}
        <PoolCreationRiskCheckboxes />
        <PoolCreationFormAction disabled={isDisabled} />
      </VStack>
    </Box>
  )
}

function InitializePoolTips() {
  return (
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
      title="Tips"
    />
  )
}
