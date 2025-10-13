import {
  Box,
  Card,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  VStack,
  Text,
  Skeleton,
} from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { LoopsWithdrawReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { BeetsTokenRow } from '../../../components/shared/BeetsTokenRow'
import { useLoops } from '../LoopsProvider'
import { formatUnits } from 'viem'
import { useLoopsGetFlyQuote } from '@/lib/modules/loops/hooks/useLoopsGetFlyQuote'
import { NumberText } from '@repo/lib/shared/components/typography/NumberText'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

export function LoopsWithdrawSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
}: LoopsWithdrawReceiptResult) {
  const { isMobile } = useBreakpoints()
  const { usdValueForToken } = useTokens()
  const { toCurrency } = useCurrency()

  const {
    chain,
    depositTransactionSteps,
    loopsWithdrawTxHash,
    wNativeAsset,
    loopedAsset,
    amountShares,
  } = useLoops()

  const {
    wethAmountOut,
    isLoading: isLoadingFlyQuote,
    minWethAmountOut,
  } = useLoopsGetFlyQuote(amountShares, chain)

  const slippage = bn(bn(wethAmountOut).minus(minWethAmountOut)).div(wethAmountOut).times(100)

  const slippageUsdValue = bn(slippage)
    .div(100)
    .times(usdValueForToken(wNativeAsset, formatUnits(wethAmountOut, wNativeAsset?.decimals ?? 18)))

  const shouldShowReceipt = !!loopsWithdrawTxHash && !isLoadingReceipt && !!receivedToken

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={depositTransactionSteps} />}
      <Card variant="modalSubSection">
        <BeetsTokenRow
          chain={chain}
          isLoading={false}
          label={shouldShowReceipt ? 'You withdrew' : 'You withdraw'}
          tokenAddress={loopedAsset?.address || ''}
          tokenAmount={amountShares}
        />
      </Card>
      <Card variant="modalSubSection">
        <BeetsTokenRow
          chain={chain}
          isLoading={isLoadingFlyQuote || isLoadingReceipt}
          label={shouldShowReceipt ? 'You received' : 'You receive'}
          tokenAddress={wNativeAsset?.address || ''}
          tokenAmount={
            shouldShowReceipt
              ? receivedToken.humanAmount
              : formatUnits(wethAmountOut, wNativeAsset?.decimals ?? 18)
          }
        />
      </Card>
      <VStack align="start" fontSize="sm" mt="sm" spacing="sm" w="full">
        <HStack justify="space-between" w="full">
          <Text color="grayText" fontSize="sm">
            Max slippage
          </Text>
          <HStack>
            {isLoadingFlyQuote ? (
              <Skeleton h="16px" my="1px" w="40px" />
            ) : (
              <NumberText color="grayText" fontSize="sm">
                {`-${toCurrency(slippageUsdValue, { abbreviated: false })} (-${fNum('slippage', slippage)})`}
              </NumberText>
            )}
            <Popover trigger="hover">
              <PopoverTrigger>
                <Box
                  _hover={{ opacity: 1 }}
                  opacity="0.5"
                  transition="opacity 0.2s var(--ease-out-cubic)"
                >
                  <InfoIcon />
                </Box>
              </PopoverTrigger>
              <PopoverContent p="sm">
                <Text fontSize="sm" variant="secondary">
                  Withdrawals may return slightly less than the displayed rate due to stS → $S
                  market swaps and normal slippage.
                </Text>
              </PopoverContent>
            </Popover>
          </HStack>
        </HStack>
        <HStack justify="space-between" w="full">
          <Text color="grayText" fontSize="sm">
            You'll get at least
          </Text>
          <HStack>
            {isLoadingFlyQuote ? (
              <Skeleton h="16px" my="1px" w="40px" />
            ) : (
              <NumberText color="grayText" fontSize="sm">
                {fNum('token', formatUnits(minWethAmountOut, wNativeAsset?.decimals ?? 18), {
                  abbreviated: false,
                })}{' '}
                {wNativeAsset?.symbol}
              </NumberText>
            )}
            <Popover trigger="hover">
              <PopoverTrigger>
                <Box
                  _hover={{ opacity: 1 }}
                  opacity="0.5"
                  transition="opacity 0.2s var(--ease-out-cubic)"
                >
                  <InfoIcon />
                </Box>
              </PopoverTrigger>
              {/* <PopoverContent p="sm">
                    <Text fontSize="sm" variant="secondary">
                      {limitTooltip}
                    </Text>
                  </PopoverContent> */}
            </Popover>
          </HStack>
        </HStack>
      </VStack>
    </AnimateHeightChange>
  )
}
