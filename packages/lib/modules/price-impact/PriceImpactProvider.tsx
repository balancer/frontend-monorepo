import { AlertTriangle, XOctagon } from 'react-feather'
import { PropsWithChildren, createContext, useCallback, useRef, useState } from 'react'
import { useMandatoryContext } from '../../shared/utils/contexts'
import { Box, BoxProps } from '@chakra-ui/react'
import { getPriceImpactColor, getPriceImpactLevel } from './price-impact.utils'

export type PriceImpactLevel = 'low' | 'medium' | 'high' | 'max' | 'unknown'

export function usePriceImpactLogic() {
  const [acceptPriceImpactRisk, setAcceptPriceImpactRisk] = useState(false)
  const [priceImpact, setPriceImpact] = useState<string | number | undefined | null>()
  const priceImpactRef = useRef(priceImpact)
  const priceImpactValue =
    priceImpact == null
      ? undefined
      : typeof priceImpact === 'string'
        ? Number(priceImpact)
        : priceImpact
  const priceImpactLevel =
    priceImpactValue == null || Number.isNaN(priceImpactValue)
      ? 'low'
      : getPriceImpactLevel(priceImpactValue)
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

  const updatePriceImpact = useCallback((nextPriceImpact: string | number | undefined | null) => {
    if (!Object.is(priceImpactRef.current, nextPriceImpact)) {
      // Reset acceptance whenever the quoted impact changes.
      setAcceptPriceImpactRisk(false)
    }

    priceImpactRef.current = nextPriceImpact
    setPriceImpact(nextPriceImpact)
  }, [])

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

/**
 * Renders nothing. Feeds a price-impact value into the PriceImpactProvider
 * at render time using the React-recommended "deriving state during render"
 * pattern, avoiding a useEffect-based state mirror.
 *
 * Consumer components that receive price impact from a react-query or other
 * source at render time should render <PriceImpactInput value={data} />
 * instead of calling setPriceImpact() inside a useEffect.
 *
 * @see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
export function PriceImpactInput({ value }: { value: string | number | undefined | null }) {
  const { setPriceImpact } = usePriceImpact()
  const [prevValue, setPrevValue] = useState(value)

  // During render: if the value changed, update provider state and
  // reset acceptance risk. The prevValue check prevents infinite loops.
  if (!Object.is(prevValue, value)) {
    setPrevValue(value)
    setPriceImpact(value)
  }

  return null
}
