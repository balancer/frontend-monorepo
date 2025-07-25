/* eslint-disable react-hooks/exhaustive-deps */
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  HStack,
  Text,
  VStack,
  Button,
  Card,
  useDisclosure,
  AccordionIcon,
  Alert,
  AlertTitle,
  AlertDescription,
  CardFooter,
  CardBody,
  useColorModeValue,
  Link,
} from '@chakra-ui/react'
import { usePriceImpact } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { ReactNode, useEffect } from 'react'
import { PriceImpactAcceptModal } from './PriceImpactAcceptModal'
import { getPriceImpactLevel } from './price-impact.utils'
import { useSwap } from '../swap/SwapProvider'
import { buildCowSwapUrl } from '../cow/cow.utils'
import { CheckIcon } from '@chakra-ui/icons'

interface PriceImpactAccordionProps {
  setNeedsToAcceptPIRisk: (value: boolean) => void
  accordionButtonComponent: ReactNode
  accordionPanelComponent: ReactNode
  isDisabled?: boolean
  // Unknown price impact due to limitations in ABA priceImpact calculation
  cannotCalculatePriceImpact?: boolean
  avoidPriceImpactAlert?: boolean
  action: 'swap' | 'add' | 'remove'
}

export function PriceImpactAccordion({
  setNeedsToAcceptPIRisk,
  accordionButtonComponent,
  accordionPanelComponent,
  isDisabled,
  cannotCalculatePriceImpact = false,
  avoidPriceImpactAlert = false,
  action,
}: PriceImpactAccordionProps) {
  const acceptHighImpactDisclosure = useDisclosure()
  const {
    priceImpactLevel,
    priceImpactColor,
    acceptPriceImpactRisk,
    hasToAcceptHighPriceImpact,
    setAcceptPriceImpactRisk,
    PriceImpactIcon,
    priceImpact,
  } = usePriceImpact()

  const isUnknownPriceImpact = cannotCalculatePriceImpact || priceImpactLevel === 'unknown'
  const { tokenIn, tokenOut, selectedChain } = useSwap()
  const showCowSwapLink = PROJECT_CONFIG.cowSupportedNetworks.includes(selectedChain)

  function getPriceImpactMessage(action: 'swap' | 'add' | 'remove'): ReactNode {
    switch (action) {
      case 'swap':
        return (
          <>
            <Text color="#000" fontSize="sm" pb="xs">
              The value of output tokens is a lot less than the input tokens after price impact and
              swap fees (per Coingecko). This is likely because your swap size is large relative to
              the market liquidity for this pair, resulting in a high price impact by unfavorably
              shifting the exchange rate.
            </Text>
            <Text color="#000" fontSize="sm">
              To reduce price impact, lower your swap size
              {showCowSwapLink ? (
                <>
                  {' '}
                  or try{' '}
                  <Link
                    _hover={{
                      color: '#fff',
                    }}
                    color="#000"
                    fontSize="sm"
                    href={buildCowSwapUrl({
                      chain: selectedChain,
                      tokenInAddress: tokenIn.address,
                      tokenOutAddress: tokenOut.address,
                    })}
                    isExternal
                    textDecor="underline"
                  >
                    CoW Swap
                  </Link>
                  .
                </>
              ) : (
                ' or try another exchange.'
              )}
            </Text>
          </>
        )
      case 'add':
        return (
          <>
            <Text color="#000" fontSize="sm" pb="xs">
              Adding custom amounts in ‘Flexible’ mode can cause high price impact, since the pool
              rebalances by ‘swapping’ some of the excess token for the under-supplied token, which
              unfavorably shifts the internal price.
            </Text>
            <Text color="#000" fontSize="sm">
              To avoid price impact, switch to ‘Proportional’ mode (if available). Or in ‘Flexible’
              mode, add tokens closer to the pool’s current ratios.
            </Text>
          </>
        )
      case 'remove':
        return (
          <>
            <Text color="#000" fontSize="sm" pb="xs">
              Removing liquidity as a single token can cause high price impact, since the pool
              rebalances by ‘swapping’ some of non-selected tokens to replace the removed token,
              which unfavorably shifts the internal price.
            </Text>
            <Text color="#000" fontSize="sm">
              To avoid price impact, switch to ‘Proportional’ mode (if available). Or in ‘Single
              token’ mode, remove a smaller amount.
            </Text>
          </>
        )
    }
  }

  function getPriceImpactTitle(action: 'swap' | 'add' | 'remove'): string {
    const label = action.charAt(0).toUpperCase() + action.slice(1)
    const level = priceImpact != null ? getPriceImpactLevel(Number(priceImpact)) : priceImpactLevel
    const extremely = level === 'max' ? 'extremely ' : ''
    return `Potential ‘${label}’ loss is ${extremely}high: ${priceImpact && fNum('priceImpact', priceImpact)}`
  }

  useEffect(() => {
    if ((hasToAcceptHighPriceImpact || isUnknownPriceImpact) && !acceptPriceImpactRisk) {
      setNeedsToAcceptPIRisk(true)
    } else {
      setNeedsToAcceptPIRisk(false)
    }
  }, [acceptPriceImpactRisk, hasToAcceptHighPriceImpact, isUnknownPriceImpact])

  const handleClick = () => {
    if (priceImpactLevel === 'high') {
      setAcceptPriceImpactRisk(true)
    } else {
      acceptHighImpactDisclosure.onOpen()
    }
  }

  const borderColor = useColorModeValue('red.300', 'red.400')

  return (
    <Box w="full">
      <Accordion allowToggle variant="button" w="full">
        <AccordionItem
          bg={isDisabled ? 'background.level2' : 'background.level3'}
          border="1px solid"
          borderColor={isDisabled ? 'border.base' : 'transparent'}
          borderRadius="md"
          isDisabled={isDisabled}
          shadow={isDisabled ? 'none' : 'md'}
          w="full"
        >
          <h2>
            <AccordionButton pl="ms" pr="sm">
              <Box as="span" flex="1" textAlign="left">
                {accordionButtonComponent}
              </Box>
              <HStack gap="xs">
                <PriceImpactIcon priceImpactLevel={priceImpactLevel} />
                <Text color={priceImpactColor} fontSize="sm">
                  Details
                </Text>
                <AccordionIcon textColor={priceImpactColor} />
              </HStack>
            </AccordionButton>
          </h2>
          <AccordionPanel p="ms">{accordionPanelComponent}</AccordionPanel>
        </AccordionItem>
      </Accordion>
      {(priceImpactLevel === 'high' || priceImpactLevel === 'max' || isUnknownPriceImpact) && (
        <>
          <VStack align="start" gap="0" mt="md" spacing="0" w="full">
            {!avoidPriceImpactAlert && (
              <Alert roundedBottom="0" roundedTop="lg" status="error">
                <PriceImpactIcon
                  alignSelf="start"
                  color="font.dark"
                  mt="1"
                  priceImpactLevel={priceImpactLevel}
                  size={24}
                />
                <Box ml="md">
                  <AlertTitle>
                    {isUnknownPriceImpact
                      ? 'Unknown potential losses'
                      : `${getPriceImpactTitle(action)}`}
                  </AlertTitle>
                  <AlertDescription>
                    <Text as="div" color="#000" fontSize="sm" whiteSpace="pre-line">
                      {isUnknownPriceImpact
                        ? 'The potential losses from this transaction cannot be calculated at this time. This may include high price impact and/or high swap fees. Only proceed if you know exactly what you are doing.'
                        : getPriceImpactMessage(action)}
                    </Text>
                  </AlertDescription>
                </Box>
              </Alert>
            )}
            <Card
              bg="rgba(255,0,0,0.04)"
              border="1px solid"
              borderColor={borderColor}
              py="md"
              roundedBottom="lg"
              roundedTop="0"
              variant="subSection"
            >
              <CardBody>
                <Text color="font.maxContrast" fontWeight="bold" mb="xs">
                  Acknowledge potential loss to continue
                </Text>
                {isUnknownPriceImpact ? (
                  <Text color="font.maxContrast" fontSize="sm">
                    I accept that the potential loss from this transaction is unknown. I understand
                    that proceeding may result in losses due to factors like high price impact
                    and/or high swap fees.
                  </Text>
                ) : (
                  <Text color="font.maxContrast" fontSize="sm">
                    I accept the potential high losses from this transaction of{' '}
                    {priceImpact && fNum('priceImpact', priceImpact)}, which may be due to factors
                    like high price impact and/or high swap fees.
                  </Text>
                )}
              </CardBody>
              <CardFooter pt="md">
                {!acceptPriceImpactRisk ? (
                  <Button onClick={handleClick} variant="maxContrast" w="full">
                    I accept {isUnknownPriceImpact ? 'unknown' : 'high'} potential losses
                  </Button>
                ) : (
                  <HStack
                    bg="background.level2"
                    border="1px solid"
                    borderColor="border.base"
                    gap="md"
                    height="40px"
                    px="md"
                    rounded="lg"
                    w="full"
                  >
                    <CheckIcon color="font.maxContrast" />
                    <Text color="font.maxContrast" fontSize="sm" fontWeight="bold">
                      {isUnknownPriceImpact ? 'Unknown' : 'High'} potential losses accepted
                    </Text>
                  </HStack>
                )}
              </CardFooter>
            </Card>
          </VStack>
          <PriceImpactAcceptModal
            isOpen={acceptHighImpactDisclosure.isOpen}
            onClose={acceptHighImpactDisclosure.onClose}
            onOpen={acceptHighImpactDisclosure.onOpen}
            setAcceptHighPriceImpact={setAcceptPriceImpactRisk}
          />
        </>
      )}
    </Box>
  )
}
