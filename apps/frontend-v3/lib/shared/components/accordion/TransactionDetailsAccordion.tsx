/* eslint-disable react-hooks/exhaustive-deps */
import { useAddLiquidity } from '@/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
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
import { usePool } from '@/lib/modules/pool/PoolProvider'
import { calcUserShareOfPool, isCowAmmPool } from '@/lib/modules/pool/pool.helpers'

export function TransactionDetailsAccordion() {
  const { totalUSDValue, priceImpactQuery } = useAddLiquidity()
  const { pool } = usePool()
  const { toCurrency } = useCurrency()
  const priceImpact = priceImpactQuery?.data
  const priceImpactUsdValue = priceImpact
    ? bn(totalUSDValue).multipliedBy(bn(priceImpact)).toString()
    : '-'

  return (
    <Accordion w="full" variant="button" allowToggle>
      <AccordionItem>
        <AccordionButton>
          <Box as="span" color="font.primary" flex="1" textAlign="left">
            Transaction Details
          </Box>
          <AccordionIcon textColor="font.highlight" />
        </AccordionButton>
        <AccordionPanel pb="md">
          <VStack w="full" textColor="grayText">
            <HStack w="full" justifyContent="space-between">
              <div>Total added</div>
              <div> {toCurrency(totalUSDValue, { abbreviated: false })}</div>
            </HStack>
            {priceImpact && (
              <HStack w="full" justifyContent="space-between">
                <div>Price impact</div>
                <div>{toCurrency(priceImpactUsdValue)}</div>
              </HStack>
            )}
            {/* <HStack w="full" justifyContent="space-between">
              <div>Final slippage</div>
              <div>TODO</div>
            </HStack> */}
            {!isCowAmmPool(pool.type) && (
              <HStack w="full" justifyContent="space-between">
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
