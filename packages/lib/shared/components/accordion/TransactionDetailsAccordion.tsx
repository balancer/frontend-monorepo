import { useAddLiquidity } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { useCurrency } from '../../hooks/useCurrency'
import { bn, fNum } from '../../utils/numbers'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { calcUserShareOfPool, isCowAmmPool } from '@repo/lib/modules/pool/pool.helpers'

export function TransactionDetailsAccordion() {
  const { totalUSDValue, priceImpactQuery } = useAddLiquidity()
  const { pool } = usePool()
  const { toCurrency } = useCurrency()
  const priceImpact = priceImpactQuery?.data
  const priceImpactUsdValue = priceImpact
    ? bn(totalUSDValue).multipliedBy(bn(priceImpact)).toString()
    : '-'

  return (
    <Accordion allowToggle variant="button" w="full">
      <AccordionItem>
        <AccordionButton>
          <Box as="span" color="font.primary" flex="1" textAlign="left">
            Transaction Details
          </Box>
          <AccordionIcon textColor="font.highlight" />
        </AccordionButton>
        <AccordionPanel pb="md">
          <VStack textColor="grayText" w="full">
            <HStack justifyContent="space-between" w="full">
              <div>Total added</div>
              <div> {toCurrency(totalUSDValue, { abbreviated: false })}</div>
            </HStack>
            {priceImpact && (
              <HStack justifyContent="space-between" w="full">
                <div>Price impact</div>
                <div>{toCurrency(priceImpactUsdValue)}</div>
              </HStack>
            )}
            {/* <HStack w="full" justifyContent="space-between">
              <div>Final slippage</div>
              <div>TODO</div>
            </HStack> */}
            {!isCowAmmPool(pool.type) && (
              <HStack justifyContent="space-between" w="full">
                <div>Share of pool</div>
                <div>{fNum('sharePercent', calcUserShareOfPool(pool))}</div>
              </HStack>
            )}
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
