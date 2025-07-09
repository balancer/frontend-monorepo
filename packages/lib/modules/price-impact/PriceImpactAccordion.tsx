/* eslint-disable react-hooks/exhaustive-deps */
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

  function getPriceImpactMessage(action: 'swap' | 'add' | 'remove'): ReactNode {
    switch (action) {
      case 'swap':
        return (
          <>
            This compares the value of the input tokens vs the output tokens, and includes price
            impact and swap fees. The high loss is most likely because your swap size is large
            relative to the market liquidity for this pair, resulting in a high price impact from an
            unfavorable exchange rate. Also, the proposed route may have high swap fees.
            <br />
            <br />
            To reduce price impact, lower your swap size or try{' '}
            <Link
              _hover={{
                color: '#fff',
              }}
              color="#000"
              fontSize="sm"
              href="https://swap.cow.fi/"
              isExternal
              textDecor="underline"
            >
              CoW Swap
            </Link>
            .
          </>
        )
      case 'add':
        return "Adding custom amounts in ‘Flexible’ mode can cause high price impact, since the pool rebalances by “swapping” some of the excess token for the under-supplied token, which shifts the internal price.\n\nSwitch to 'Proportional' mode (if available) to avoid price impact. Or in 'Flexible' mode, add tokens closer to the pool’s current ratios."
      case 'remove':
        return "Removing liquidity as a single token can cause high price impact, since the pool rebalances by “swapping” some of non-selected token(s) to replace the removed token, which shifts the internal price. The higher the price impact, the less tokens you will receive.\n\nSwitch to 'Proportional' mode (if available) to avoid price impact. Or in 'Single token' mode, remove a smaller amount."
    }
  }

  function getPriceImpactTitle(action: 'swap' | 'add' | 'remove'): string {
    switch (action) {
      case 'swap':
        return `Potential ‘Swap’ loss is high: ${priceImpact && fNum('priceImpact', priceImpact)}`
      case 'add':
        return `Potential ‘Add’ loss is high: ${priceImpact && fNum('priceImpact', priceImpact)}`
      case 'remove':
        return `Potential ‘Remove’ loss is high: ${priceImpact && fNum('priceImpact', priceImpact)}`
    }
  }

  useEffect(() => {
    if ((hasToAcceptHighPriceImpact || isUnknownPriceImpact) && !acceptPriceImpactRisk) {
      setNeedsToAcceptPIRisk(true)
    } else {
      setNeedsToAcceptPIRisk(false)
    }
  }, [acceptPriceImpactRisk, hasToAcceptHighPriceImpact, isUnknownPriceImpact])

  const handleClick = () => {
    if (priceImpactLevel === 'high' || isUnknownPriceImpact) {
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
                      ? 'Unknown price impact'
                      : `${getPriceImpactTitle(action)}`}
                  </AlertTitle>
                  <AlertDescription>
                    <Text as="div" color="#000" fontSize="sm" whiteSpace="pre-line">
                      {isUnknownPriceImpact
                        ? 'The price impact cannot be calculated. Only proceed if you know exactly what you are doing.'
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
