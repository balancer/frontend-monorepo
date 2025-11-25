import {
  Card,
  Text,
  HStack,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  useDisclosure,
} from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { SeedAmountProportions } from '../steps/fund/SeedAmountProportions'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { TransactionStepsResponse } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { PoolDetailsContent } from '../preview/PreviewPoolDetails'
import { isReClammPool } from '../helpers'
import { useWatch } from 'react-hook-form'

export function PoolSummary({ transactionSteps }: { transactionSteps: TransactionStepsResponse }) {
  const { isMobile } = useBreakpoints()
  const { poolCreationForm, poolAddress } = usePoolCreationForm()
  const [network, poolType] = useWatch({
    control: poolCreationForm.control,
    name: ['network', 'poolType'],
  })

  const showTokenAmountSummary = !isReClammPool(poolType) || poolAddress

  return (
    <AnimateHeightChange spacing={3} w="full">
      {isMobile && <MobileStepTracker chain={network} transactionSteps={transactionSteps} />}
      <PoolTitleCard />
      {showTokenAmountSummary && <PoolTokenAmountsCard />}
      {showTokenAmountSummary && <SeedAmountProportions variant="modalSubSection" />}
      <PoolDetailsCard />
    </AnimateHeightChange>
  )
}

function PoolTitleCard() {
  const { poolCreationForm } = usePoolCreationForm()
  const [poolTokens, symbol, network] = useWatch({
    control: poolCreationForm.control,
    name: ['poolTokens', 'symbol', 'network'],
  })

  return (
    <Card variant="modalSubSection">
      <VStack align="start" spacing="md">
        <Text color="font.secondary">{symbol}</Text>
        <HStack flexWrap="wrap" gap="sm">
          <NetworkIcon bg="background.level4" chain={network} shadow="lg" size={8} />

          {poolTokens.map((token, idx) => (
            <Box flexShrink={0} key={idx}>
              <Card
                bg="background.level4"
                key={idx}
                paddingY="sm"
                rounded="full"
                variant="subSection"
              >
                <HStack key={token.address}>
                  <TokenIcon
                    address={token.address}
                    alt={token.address || ''}
                    chain={network}
                    size={20}
                  />
                  <Text>{token.data?.symbol}</Text>
                </HStack>
              </Card>
            </Box>
          ))}
        </HStack>
      </VStack>
    </Card>
  )
}

function PoolTokenAmountsCard() {
  const { poolCreationForm } = usePoolCreationForm()
  const [poolTokens, network] = useWatch({
    control: poolCreationForm.control,
    name: ['poolTokens', 'network'],
  })
  const { usdValueForTokenAddress } = useTokens()
  const { toCurrency } = useCurrency()

  const poolTokenAmounts = poolTokens
    .map(token => {
      const { data, address } = token
      if (!data || !address) return null
      const { chain, symbol, name } = data
      const usdValue = usdValueForTokenAddress(address, chain, token.amount, token.usdPrice)
      return { address, symbol, name, amount: token.amount, usdValue }
    })
    .filter(token => token !== null)

  return (
    <Card variant="modalSubSection">
      <VStack align="start" spacing="md">
        <Text>You’re seeding the pool with</Text>
        {poolTokenAmounts.map(({ address, symbol, amount, usdValue, name }) => (
          <HStack justify="space-between" key={address} w="full">
            <HStack align="center" spacing="sm">
              <TokenIcon address={address} alt={address || ''} chain={network} size={40} />
              <VStack align="start" spacing="xxs">
                <Text fontWeight="bold">{symbol}</Text>
                <Text color="font.secondary" fontSize="sm">
                  {name}
                </Text>
              </VStack>
            </HStack>
            <VStack align="end">
              <Text fontWeight="bold">{amount}</Text>
              <Text color="font.secondary" fontSize="sm">
                {toCurrency(usdValue)}
              </Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </Card>
  )
}

function PoolDetailsCard() {
  const { poolCreationForm } = usePoolCreationForm()
  const swapFeePercentage = useWatch({
    control: poolCreationForm.control,
    name: 'swapFeePercentage',
  })
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Accordion allowToggle variant="button" w="full">
      <AccordionItem
        bg="background.level3"
        border="1px solid"
        borderColor="transparent"
        borderRadius="md"
        shadow="md"
        w="full"
      >
        <AccordionButton onClick={onToggle} pl="sm" pr="sm" py={3}>
          <Box as="span" flex="1" textAlign="left">
            <HStack justify="space-between" w="full">
              {!isOpen && (
                <Text color="font.secondary">Swap fee percentage: {swapFeePercentage}%</Text>
              )}
              <Text color="font.secondary">Details</Text>
            </HStack>
          </Box>
          <AccordionIcon />
        </AccordionButton>

        <AccordionPanel p="ms">
          <VStack align="start" spacing="sm" w="full">
            <PoolDetailsContent />
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
