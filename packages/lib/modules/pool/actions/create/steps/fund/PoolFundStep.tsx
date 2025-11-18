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
import { PoolCreationToken, SupportedPoolTypes } from '../../types'
import { useEffect, useRef } from 'react'
import { formatUnits } from 'viem'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { useGyroEclpInitAmountsRatio } from './useGyroEclpInitAmountsRatio'
import { isWeightedPool, isReClammPool, isGyroEllipticPool } from '../../helpers'
import { PoolType } from '@balancer/sdk'

export function PoolFundStep() {
  const { poolAddress, poolCreationForm } = usePoolCreationForm()
  const [poolType, poolTokens, hasAcceptedTokenWeightsRisk, hasAcceptedPoolCreationRisk] =
    poolCreationForm.watch([
      'poolType',
      'poolTokens',
      'hasAcceptedTokenWeightsRisk',
      'hasAcceptedPoolCreationRisk',
    ])
  const { hasValidationErrors } = useTokenInputsValidation()

  const isTokenAmountsValid =
    (validatePoolTokens.isValidTokenAmounts(poolTokens) && !hasValidationErrors) ||
    (isReClammPool(poolType) && !poolAddress)

  const hasAcceptedRisks = isWeightedPool(poolType)
    ? hasAcceptedTokenWeightsRisk && hasAcceptedPoolCreationRisk
    : hasAcceptedPoolCreationRisk

  const isDisabled =
    !poolCreationForm.formState.isValid || !hasAcceptedRisks || !isTokenAmountsValid
  const showTokenAmountInputs = !isReClammPool(poolType) || poolAddress

  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        <SeedPoolAlert poolType={poolType} />

        <Heading color="font.maxContrast" size="md">
          Seed initial pool liquidity
        </Heading>

        {showTokenAmountInputs && (
          <>
            {poolTokens.map((token, idx) => (
              <TokenAmountInput
                idx={idx}
                key={idx}
                poolTokens={poolTokens}
                poolType={poolType}
                token={token}
              />
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

interface TokenAmountInputProps {
  token: PoolCreationToken
  idx: number
  poolType: SupportedPoolTypes
  poolTokens: PoolCreationToken[]
}

function TokenAmountInput({ token, idx, poolType, poolTokens }: TokenAmountInputProps) {
  const { updatePoolToken, poolAddress, poolCreationForm } = usePoolCreationForm()
  const [network] = poolCreationForm.watch(['network', 'poolType'])
  const { reClammInitAmounts } = useReClammInitAmounts(isReClammPool(poolType), poolAddress, token)
  const eclpInitAmountsRatio = useGyroEclpInitAmountsRatio()

  const lastUserUpdatedAmountIdx = useRef<number | null>(null)

  const otherTokenInputIdx = idx === 0 ? 1 : 0
  const otherToken = poolTokens[otherTokenInputIdx]

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

function SeedPoolAlert({ poolType }: { poolType: PoolType }) {
  const { poolAddress } = usePoolCreationForm()
  const { projectName } = PROJECT_CONFIG

  if (isReClammPool(poolType)) {
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
          content="When you enter a seed amount for one of the ReClamm pool tokens, the other amount is proportionally autofilled to maintain the required price ratio for pool initialization."
          status="info"
        />
      )
    }
  }

  if (isGyroEllipticPool(poolType)) {
    return (
      <BalAlert
        content="When you enter a seed amount for one of the Gyro ECLP tokens, the other amount is proportionally autofilled to maintain the recommended price ratio for pool initialization."
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
