import { CardBody, VStack, Text, Divider, HStack, Box } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { CardHeaderRow, CardDataRow, IdentifyTokenCell, DefaultDataRow } from './PreviewCardRows'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { formatUnits } from 'viem'
import { PreviewPoolCreationCard } from './PreviewPoolCreationCard'
import { TokenMissingPriceWarning } from '@repo/lib/modules/tokens/TokenMissingPriceWarning'
import { usePoolTokenPriceWarnings } from '@repo/lib/modules/pool/usePoolTokenPriceWarnings'
import { useWatch } from 'react-hook-form'

export function PreviewPoolTokensInWallet() {
  return (
    <PreviewPoolCreationCard stepTitle="Tokens">
      <CardHeaderRow columnNames={['Pool tokens in my wallet', 'Token Value', '%']} />
      <CardBody>
        <VStack spacing="md">
          <PoolTokensInWalletContent />
        </VStack>
      </CardBody>
    </PreviewPoolCreationCard>
  )
}

function PoolTokensInWalletContent() {
  const { poolCreationForm } = usePoolCreationForm()
  const poolTokens = useWatch({ control: poolCreationForm.control, name: 'poolTokens' })
  const { toCurrency } = useCurrency()
  const { usdValueForTokenAddress } = useTokens()
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const { tokenPriceTip, tokenWeightTip } = usePoolTokenPriceWarnings()

  if (isBalancesLoading) return <DefaultCardContent />

  const poolTokensWithUserBalances = poolTokens
    .map(token => {
      const { data, address } = token
      if (!data || !address) return null

      const userBalanceRaw = balanceFor(address)
      if (userBalanceRaw === undefined) return null

      const { decimals, chain, symbol } = data
      const userBalanceHuman = formatUnits(userBalanceRaw.amount, decimals)
      const userBalanceUsd = usdValueForTokenAddress(
        address,
        chain,
        userBalanceHuman,
        token.usdPrice
      )
      return { address, symbol, chain, userBalanceUsd, userBalanceHuman }
    })
    .filter(token => token !== null)
    .filter(token => {
      return token && (token.userBalanceUsd !== '0' || token.userBalanceHuman !== '0')
    })

  const userHasPoolTokens = poolTokensWithUserBalances.length > 0
  if (!userHasPoolTokens) return <DefaultCardContent />

  const totalLiquidityUsd = poolTokensWithUserBalances.reduce((acc, token) => {
    return acc + Number(token.userBalanceUsd || 0)
  }, 0)

  return (
    <>
      <AnimatePresence initial={false}>
        {poolTokensWithUserBalances.map(token => (
          <motion.div
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            key={token.address}
            style={{ width: '100%', overflow: 'hidden', zIndex: 1000 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <Box pb="md">
              <CardDataRow
                data={[
                  <IdentifyTokenCell
                    address={token.address}
                    chain={token.chain}
                    symbol={token.symbol}
                  />,
                  <HStack justify="end">
                    {token.userBalanceUsd !== '0' ? (
                      <Text>{toCurrency(token.userBalanceUsd)}</Text>
                    ) : (
                      <TokenMissingPriceWarning message={tokenPriceTip} />
                    )}
                  </HStack>,
                  <HStack justify="end">
                    {token.userBalanceUsd !== '0' ? (
                      <Text>
                        {((Number(token.userBalanceUsd) / totalLiquidityUsd) * 100).toFixed(2) +
                          '%'}
                      </Text>
                    ) : (
                      <TokenMissingPriceWarning message={tokenWeightTip} />
                    )}
                  </HStack>,
                ]}
              />
            </Box>
          </motion.div>
        ))}
      </AnimatePresence>
      <>
        <Divider />
        <CardDataRow
          data={[
            <Text fontWeight="semibold">Total liquidity</Text>,
            <Text align="right">{toCurrency(totalLiquidityUsd)}</Text>,
            <Text align="right">100%</Text>,
          ]}
        />
      </>
    </>
  )
}

function DefaultCardContent() {
  return (
    <>
      <DefaultDataRow />
      <DefaultDataRow />
    </>
  )
}
