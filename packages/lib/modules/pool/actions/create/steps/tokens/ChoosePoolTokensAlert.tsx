import { SupportedPoolTypes } from '../../types'
import { WeightedPoolStructure } from '../../constants'
import { isGyroEllipticPool, isStablePool, isCustomWeightedPool } from '../../helpers'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { validatePoolTokens } from '../../validatePoolCreationForm'
import { Box } from '@chakra-ui/react'

type ChoosePoolTokensAlertProps = {
  poolType: SupportedPoolTypes
  weightedPoolStructure: WeightedPoolStructure
}

export function ChoosePoolTokensAlert({
  poolType,
  weightedPoolStructure,
}: ChoosePoolTokensAlertProps) {
  const message = getPoolMessage({ poolType, weightedPoolStructure })
  if (!message) return null

  const maxTokens = validatePoolTokens.maxTokens(poolType)

  return (
    <Box width="500px">
      <BalAlert
        content={message}
        status="info"
        title={
          isCustomWeightedPool(poolType, weightedPoolStructure)
            ? `Add up to ${maxTokens} tokens in ${poolType} pools`
            : undefined
        }
      />
    </Box>
  )
}

type GetPoolMessageProps = {
  poolType: SupportedPoolTypes
  weightedPoolStructure: WeightedPoolStructure
}

function getPoolMessage({ poolType, weightedPoolStructure }: GetPoolMessageProps): string | null {
  if (isGyroEllipticPool(poolType)) {
    return "Gyroscope's elliptic concentrated liquidity pools offer the flexibility to asymmetrically focus liquidity. You can only add 2 tokens into a Gyro E-CLP."
  }

  if (isStablePool(poolType)) {
    return 'Stable Pools are optimal for assets expected to consistently trade at near parity or with a known exchange rate. You can add up to 5 tokens in a stable pool but beware—most pool actions like creation and add/remove liquidity become more expensive with each additional token.'
  }

  if (isCustomWeightedPool(poolType, weightedPoolStructure)) {
    return 'Note: Most pool actions like creation and add/remove liquidity become more expensive with each additional token.'
  }

  return null
}
