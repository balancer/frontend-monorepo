import { AlertTriangle, XOctagon } from 'react-feather'
import { PropsWithChildren, createContext, useState } from 'react'
import { useMandatoryContext } from '../../shared/utils/contexts'
import { Box, BoxProps } from '@chakra-ui/react'
import { getPriceImpactColor, getPriceImpactLevel } from './price-impact.utils'

export type PriceImpactLevel = 'low' | 'medium' | 'high' | 'max' | 'unknown'

export function usePriceImpactLogic() {
  const [acceptPriceImpactRisk, setAcceptPriceImpactRisk] = useState(false)
  const [priceImpact, setPriceImpact] = useState<string | number | undefined | null>()
  const priceImpactValue =
    priceImpact == null
      ? undefined
      : typeof priceImpact === 'string'
        ? Number(priceImpact)
        : priceImpact
  const priceImpactLevel = priceImpactValue == null ? 'low' : getPriceImpactLevel(priceImpactValue)
  const priceImpactColor = getPriceImpactColor(priceImpactLevel)
  const hasToAcceptHighPriceImpact =
    priceImpactLevel === 'high' || priceImpactLevel === 'max' || priceImpactLevel === 'unknown'

  function PriceImpactIcon({
    priceImpactLevel,
    size = 16,
    ...rest
  }: { priceImpactLevel: PriceImpactLevel; size?: number } & BoxProps) {
    const iconColor = getPriceImpactColor(priceImpactLevel)

    switch (priceImpactLevel) {
      case 'unknown':
      case 'high':
      case 'max':
        return (
          <Box color={iconColor} {...rest}>
            <XOctagon size={size} />
          </Box>
        )
      case 'medium':
        return (
          <Box color={iconColor} {...rest}>
            <AlertTriangle size={size} />
          </Box>
        )
      case 'low':
      default:
        return null
    }
  }

  function updatePriceImpact(nextPriceImpact: string | number | undefined | null) {
    setPriceImpact(nextPriceImpact)
    // Reset acceptance whenever the quoted impact changes.
    setAcceptPriceImpactRisk(false)
  }

  function resetPriceImpact() {
    updatePriceImpact(undefined)
  }

  return {
    priceImpactLevel,
    priceImpactColor,
    acceptPriceImpactRisk,
    hasToAcceptHighPriceImpact,
    priceImpact,
    setAcceptPriceImpactRisk,
    PriceImpactIcon,
    setPriceImpact: updatePriceImpact,
    resetPriceImpact,
  }
}

export type Result = ReturnType<typeof usePriceImpactLogic>
export const PriceImpactContext = createContext<Result | null>(null)

export function PriceImpactProvider({ children }: PropsWithChildren) {
  const priceImpact = usePriceImpactLogic()

  return <PriceImpactContext.Provider value={priceImpact}>{children}</PriceImpactContext.Provider>
}

export const usePriceImpact = (): Result => useMandatoryContext(PriceImpactContext, 'PriceImpact')
