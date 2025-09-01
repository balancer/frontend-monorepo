import { Card, CardBody, VStack, Text, Divider } from '@chakra-ui/react'
import { CardHeaderRow, CardDataRow, IdentifyTokenCell, DefaultDataRow } from './PreviewCardRows'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { formatUnits } from 'viem'

export function PreviewPoolTokensInWallet({ isBeforeStep }: { isBeforeStep: boolean }) {
  return (
    <Card opacity={isBeforeStep ? 0.5 : 1}>
      <CardHeaderRow columnNames={['Pool tokens in my wallet', 'Token Value', '%']} />
      <CardBody>
        <VStack spacing="md">
          <PoolTokensInWalletContent />
        </VStack>
      </CardBody>
    </Card>
  )
}

function PoolTokensInWalletContent() {
  const { poolTokens } = usePoolCreationForm()
  const { toCurrency } = useCurrency()
  const { usdValueForTokenAddress } = useTokens()
  const { balanceFor, isBalancesLoading } = useTokenBalances()

  if (isBalancesLoading) return <DefaultCardContent />

  const poolTokensWithUserBalances = poolTokens
    .map(token => {
      const { data, address } = token
      if (!data || !address) return null

      const userBalanceRaw = balanceFor(address)
      if (userBalanceRaw === undefined) return null

      const { decimals, chain, symbol } = data
      const userBalanceHuman = formatUnits(userBalanceRaw.amount, decimals)
      const userBalanceUsd = usdValueForTokenAddress(address, chain, userBalanceHuman)
      return { address, symbol, chain, userBalanceUsd }
    })
    .filter(token => token !== null)
    .filter(token => token && token.userBalanceUsd !== '0')

  const userHasPoolTokens = poolTokensWithUserBalances.length > 0
  if (!userHasPoolTokens) return <DefaultCardContent />

  const totalLiquidityUsd = poolTokensWithUserBalances.reduce((acc, token) => {
    return acc + Number(token.userBalanceUsd)
  }, 0)

  return (
    <>
      {poolTokensWithUserBalances.map(token => (
        <CardDataRow
          data={[
            <IdentifyTokenCell address={token.address} chain={token.chain} symbol={token.symbol} />,
            <Text align="right">{toCurrency(token.userBalanceUsd)}</Text>,
            <Text align="right">
              {((Number(token.userBalanceUsd) / totalLiquidityUsd) * 100).toFixed(2)}%
            </Text>,
          ]}
          key={token.address}
        />
      ))}
      <Divider />
      <CardDataRow
        data={[
          <Text fontWeight="semibold">Total liquidity</Text>,
          <Text align="right">{toCurrency(totalLiquidityUsd)}</Text>,
          <Text align="right">100%</Text>,
        ]}
      />
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
