import {
  Accordion,
  Box,
  HStack,
  Text,
  VStack,
  Button,
  Card,
  useDisclosure,
  Alert,
  Link,
  Icon,
} from '@chakra-ui/react'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { usePriceImpact } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { ReactNode, useEffect } from 'react'
import { PriceImpactAcceptModal } from './PriceImpactAcceptModal'
import { getPriceImpactLevel } from './price-impact.utils'
import { LuCheck } from 'react-icons/lu'

interface PriceImpactAccordionProps {
  setNeedsToAcceptPIRisk: (value: boolean) => void
  accordionButtonComponent: ReactNode
  accordionPanelComponent: ReactNode
  disabled?: boolean
  // Unknown price impact due to limitations in ABA priceImpact calculation
  cannotCalculatePriceImpact?: boolean
  avoidPriceImpactAlert?: boolean
  action: 'swap' | 'add' | 'remove'
  cowLink?: string
}

export function PriceImpactAccordion({
  setNeedsToAcceptPIRisk,
  accordionButtonComponent,
  accordionPanelComponent,
  disabled,
  cannotCalculatePriceImpact = false,
  avoidPriceImpactAlert = false,
  action,
  cowLink,
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

  const colorMode = useThemeColorMode()
  const borderColor = colorMode === 'dark' ? 'red.400' : 'red.300'

  return (
    <Box w="full">
      <Accordion.Root collapsible variant="button" w="full">
        <Accordion.Item
          bg={disabled ? 'background.level2' : 'background.level3'}
          border="1px solid"
          borderColor={disabled ? 'border.base' : 'transparent'}
          borderRadius="md"
          disabled={disabled}
          shadow={disabled ? 'none' : 'md'}
          value="item-0"
          w="full"
        >
          <h2>
            <Accordion.ItemTrigger pl="ms" pr="sm">
              <Box as="span" flex="1" textAlign="left">
                {accordionButtonComponent}
              </Box>
              <HStack gap="xs">
                <PriceImpactIcon priceImpactLevel={priceImpactLevel} />
                <Text color={priceImpactColor} fontSize="sm">
                  Details
                </Text>
                <Accordion.ItemIndicator textColor={priceImpactColor} />
              </HStack>
            </Accordion.ItemTrigger>
          </h2>
          <Accordion.ItemContent p="ms">
            <Accordion.ItemBody>{accordionPanelComponent}</Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
      {(priceImpactLevel === 'high' || priceImpactLevel === 'max' || isUnknownPriceImpact) && (
        <>
          <VStack align="start" gap="0" mt="md" w="full">
            {!avoidPriceImpactAlert && (
              <Alert.Root roundedBottom="0" roundedTop="lg" status="error">
                <PriceImpactIcon
                  alignSelf="start"
                  color="font.dark"
                  mt="1"
                  priceImpactLevel={priceImpactLevel}
                  size={24}
                />
                <Box ml="md">
                  <Alert.Title>
                    {isUnknownPriceImpact
                      ? 'Unknown potential losses'
                      : `${getPriceImpactTitle(action)}`}
                  </Alert.Title>
                  <Alert.Description>
                    {isUnknownPriceImpact ? (
                      <Text as="div" color="#000" fontSize="sm" whiteSpace="pre-line">
                        'The potential losses from this transaction cannot be calculated at this
                        time. This may include high price impact and/or high swap fees. Only proceed
                        if you know exactly what you are doing.'
                      </Text>
                    ) : (
                      <PriceImpactMessage action={action} cowLink={cowLink} />
                    )}
                  </Alert.Description>
                </Box>
              </Alert.Root>
            )}
            <Card.Root
              bg="rgba(255,0,0,0.04)"
              border="1px solid"
              borderColor={borderColor}
              py="md"
              roundedBottom="lg"
              roundedTop="0"
              variant="subSection"
            >
              <Card.Body>
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
              </Card.Body>
              <Card.Footer pt="md">
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
                    <Icon as={LuCheck} color="font.maxContrast" />
                    <Text color="font.maxContrast" fontSize="sm" fontWeight="bold">
                      {isUnknownPriceImpact ? 'Unknown' : 'High'} potential losses accepted
                    </Text>
                  </HStack>
                )}
              </Card.Footer>
            </Card.Root>
          </VStack>
          <PriceImpactAcceptModal
            isOpen={acceptHighImpactDisclosure.open}
            onClose={acceptHighImpactDisclosure.onClose}
            onOpen={acceptHighImpactDisclosure.onOpen}
            setAcceptHighPriceImpact={setAcceptPriceImpactRisk}
          />
        </>
      )}
    </Box>
  )
}

function PriceImpactMessage({
  action,
  cowLink,
}: {
  action: 'swap' | 'add' | 'remove'
  cowLink: string | undefined
}) {
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
            {cowLink ? (
              <>
                {' '}
                or try{' '}
                <Link
                  _hover={{
                    color: '#fff',
                  }}
                  color="#000"
                  fontSize="sm"
                  href={cowLink}
                  rel="noopener noreferrer"
                  target="_blank"
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
            rebalances by ‘swapping’ some of non-selected tokens to replace the removed token, which
            unfavorably shifts the internal price.
          </Text>
          <Text color="#000" fontSize="sm">
            To avoid price impact, switch to ‘Proportional’ mode (if available). Or in ‘Single
            token’ mode, remove a smaller amount.
          </Text>
        </>
      )
  }
}
