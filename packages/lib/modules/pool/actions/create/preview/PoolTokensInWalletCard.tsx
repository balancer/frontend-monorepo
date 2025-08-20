import { Card, CardBody, VStack, Text, Divider } from '@chakra-ui/react'
import { CardHeaderRow, CardDataRow, IdentifyTokenCell, DefaultDataRow } from './PreviewCardRows'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { formatUnits } from 'viem'
import { PoolType } from '@balancer/sdk'

export function PoolTokensInWalletCard() {
  const {
    poolConfigForm: { watch },
  } = usePoolCreationForm()
  const { poolTokens, poolType } = watch()

  const { toCurrency } = useCurrency()
  const { usdValueForTokenAddress } = useTokens()
  const { balanceFor, isBalancesLoading } = useTokenBalances()

  if (isBalancesLoading) return null

  const poolTokensWithUserBalances = poolTokens
    .map(token => {
      if (!token.data) return null
      const tokenAddress = token.config.address
      const userBalanceRaw = balanceFor(tokenAddress)
      if (userBalanceRaw === undefined) return null

      const userBalanceHuman = formatUnits(userBalanceRaw.amount, token.data.decimals)
      const userBalanceUsd = usdValueForTokenAddress(
        token.data.address,
        token.data.chain,
        userBalanceHuman
      )
      return {
        address: token.data.address,
        symbol: token.data.symbol,
        chain: token.data.chain,
        userBalanceUsd,
      }
    })
    .filter(token => token !== null)
    .filter(token => token && token.userBalanceUsd !== '0')

  const totalLiquidityUsd = poolTokensWithUserBalances.reduce((acc, token) => {
    return acc + Number(token.userBalanceUsd)
  }, 0)

  const isWeightedPool = poolType === PoolType.Weighted

  const userHasPoolTokens = poolTokensWithUserBalances.length > 0

  return (
    <Card>
      <CardHeaderRow columnNames={['Pool tokens in my wallet', 'Token Value', '%']} />
      <CardBody>
        <VStack spacing="md">
          {userHasPoolTokens ? (
            poolTokensWithUserBalances.map(token => (
              <CardDataRow
                data={[
                  <IdentifyTokenCell
                    address={token.address}
                    chain={token.chain}
                    symbol={token.symbol}
                  />,
                  <Text align="right">{toCurrency(token.userBalanceUsd)}</Text>,
                  <Text align="right">
                    {((Number(token.userBalanceUsd) / totalLiquidityUsd) * 100).toFixed(2)}%
                  </Text>,
                ]}
                key={token.address}
              />
            ))
          ) : (
            <>
              <DefaultDataRow />
              <DefaultDataRow />
            </>
          )}
          {userHasPoolTokens && (
            <>
              <Divider />
              <CardDataRow
                data={[
                  <Text>Total liquidity</Text>,
                  <Text align="right">{toCurrency(totalLiquidityUsd)}</Text>,
                  <Text align="right">100%</Text>,
                ]}
              />
              {isWeightedPool && (
                <CardDataRow
                  data={[
                    <Text>Total if added proportional to weights</Text>,
                    <Text align="right">TODO</Text>,
                    <Text align="right">TODO</Text>,
                  ]}
                />
              )}
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
