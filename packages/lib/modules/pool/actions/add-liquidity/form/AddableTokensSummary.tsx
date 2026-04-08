import { Box, Card, HStack, Skeleton, Text } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
import { AlertIcon } from '@repo/lib/shared/components/icons/AlertIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

type Props = {
  isProportional: boolean
  isBalancesLoading: boolean
  isUserAccountLoading: boolean
  isFlexibleWarning: boolean
  isProportionalWarning: boolean
  flexibleAddableLabel: string
  proportionalAddableLabel: string
  flexibleWarningTooltip: string
  proportionalWarningTooltip: string
  addableUsdBalance: string
  proportionalAddableUsdBalance: string
  isFlexibleMaxApplied: boolean
  isProportionalMaxApplied: boolean
  canApplyProportionalMax: boolean
  handleFlexibleMaxClick: () => void
  handleProportionalMaxClick: () => void
  clearAmountsIn: () => void
}

export function AddableTokensSummary({
  isProportional,
  isBalancesLoading,
  isUserAccountLoading,
  isFlexibleWarning,
  isProportionalWarning,
  flexibleAddableLabel,
  proportionalAddableLabel,
  flexibleWarningTooltip,
  proportionalWarningTooltip,
  addableUsdBalance,
  proportionalAddableUsdBalance,
  isFlexibleMaxApplied,
  isProportionalMaxApplied,
  canApplyProportionalMax,
  handleFlexibleMaxClick,
  handleProportionalMaxClick,
  clearAmountsIn,
}: Props) {
  const { toCurrency } = useCurrency()

  const isLoading = isBalancesLoading || isUserAccountLoading
  const showWarning =
    (!isProportional && isFlexibleWarning) || (isProportional && isProportionalWarning)
  const showValid = !isLoading && !showWarning

  const warningOverlayStyles = {
    _before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      bg: 'font.warning',
      opacity: 0.05,
      borderRadius: 'inherit',
      pointerEvents: 'none',
    },
    _after: {
      content: '""',
      position: 'absolute',
      inset: 0,
      border: '1px solid',
      borderColor: 'font.warning',
      opacity: 0.5,
      borderRadius: 'inherit',
      pointerEvents: 'none',
    },
  }

  const validOverlayStyles = {
    _before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      bg: 'font.highlight',
      opacity: 0.03,
      borderRadius: 'inherit',
      pointerEvents: 'none',
    },
    _after: {
      content: '""',
      position: 'absolute',
      inset: 0,
      border: '1px solid',
      borderColor: 'font.highlight',
      opacity: 0.4,
      borderRadius: 'inherit',
      pointerEvents: 'none',
    },
  }

  return (
    <Card
      bg="background.level1"
      borderColor="transparent"
      p={['sm', 'ms']}
      position="relative"
      variant="subSection"
      w="full"
      {...(showValid ? validOverlayStyles : showWarning ? warningOverlayStyles : {})}
    >
      {isLoading ? (
        <HStack justify="space-between" position="relative" w="full" zIndex={1}>
          <Skeleton height="20px" width="120px" />
          <HStack gap={1.5}>
            <Skeleton height="20px" width="80px" />
            <Skeleton height="20px" width="30px" />
          </HStack>
        </HStack>
      ) : (
        <HStack justify="space-between" position="relative" w="full" zIndex={1}>
          {!isProportional && isFlexibleWarning ? (
            <TooltipWithTouch label={flexibleWarningTooltip} placement="top-start">
              <HStack color="font.warning" cursor="help" gap={1}>
                <Text color="font.warning" fontSize="sm">
                  {flexibleAddableLabel}
                </Text>
                <AlertIcon height="14" width="14" />
              </HStack>
            </TooltipWithTouch>
          ) : null}

          {!isProportional && !isFlexibleWarning ? (
            <Text color="grayText" fontSize="sm">
              {flexibleAddableLabel}
            </Text>
          ) : null}

          {isProportional && isProportionalWarning ? (
            <TooltipWithTouch label={proportionalWarningTooltip} placement="top-start">
              <HStack color="font.warning" cursor="help" gap={1}>
                <Text color="font.warning" fontSize="sm">
                  {proportionalAddableLabel}
                </Text>
                <AlertIcon height="14" width="14" />
              </HStack>
            </TooltipWithTouch>
          ) : null}

          {isProportional && !isProportionalWarning ? (
            <Text color="grayText" fontSize="sm">
              {proportionalAddableLabel}
            </Text>
          ) : null}

          {!isProportional ? (
            <HStack gap={1.5}>
              <Text color="grayText" fontSize="sm">
                {toCurrency(addableUsdBalance, { abbreviated: false })}
              </Text>
              <Box minW="36px" textAlign="right">
                <AnimatePresence mode="wait">
                  <motion.div
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key={isFlexibleMaxApplied ? 'reset' : 'max'}
                    transition={{ duration: 0.15 }}
                  >
                    {isFlexibleMaxApplied && !isFlexibleWarning ? (
                      <Text
                        color="font.default"
                        cursor="pointer"
                        fontSize="sm"
                        onClick={() => clearAmountsIn()}
                      >
                        Reset
                      </Text>
                    ) : (
                      <Text
                        color={isFlexibleWarning ? 'grayText' : 'font.highlight'}
                        cursor={isFlexibleWarning ? 'not-allowed' : 'pointer'}
                        fontSize="sm"
                        onClick={isFlexibleWarning ? undefined : handleFlexibleMaxClick}
                        opacity={isFlexibleWarning ? 0.5 : 1}
                      >
                        Max
                      </Text>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Box>
            </HStack>
          ) : (
            <HStack gap={1.5}>
              <motion.div layout transition={{ duration: 0.2, ease: 'easeIn' }}>
                <Text color="grayText" fontSize="sm">
                  {toCurrency(proportionalAddableUsdBalance, { abbreviated: false })}
                </Text>
              </motion.div>
              <motion.div
                layout
                style={{ position: 'relative' }}
                transition={{ duration: 0.2, ease: 'easeIn' }}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {isProportionalMaxApplied && canApplyProportionalMax && !isProportionalWarning ? (
                    <motion.div
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0 } }}
                      initial={{ opacity: 0, x: 5 }}
                      key="clear"
                      style={{ transformOrigin: 'right', whiteSpace: 'nowrap' }}
                      transition={{ duration: 0.2, ease: 'easeIn' }}
                    >
                      <Text
                        color="font.default"
                        cursor="pointer"
                        fontSize="sm"
                        onClick={() => clearAmountsIn()}
                      >
                        Reset
                      </Text>
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0 } }}
                      initial={{ opacity: 0, x: -5 }}
                      key="max"
                      style={{ transformOrigin: 'right', whiteSpace: 'nowrap' }}
                      transition={{ duration: 0.2, ease: 'easeIn' }}
                    >
                      <Text
                        color={
                          !canApplyProportionalMax || isProportionalWarning
                            ? 'grayText'
                            : 'font.highlight'
                        }
                        cursor={
                          !canApplyProportionalMax || isProportionalWarning
                            ? 'not-allowed'
                            : 'pointer'
                        }
                        fontSize="sm"
                        onClick={
                          !canApplyProportionalMax || isProportionalWarning
                            ? undefined
                            : handleProportionalMaxClick
                        }
                        opacity={!canApplyProportionalMax || isProportionalWarning ? 0.5 : 1}
                      >
                        Max
                      </Text>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </HStack>
          )}
        </HStack>
      )}
    </Card>
  )
}
