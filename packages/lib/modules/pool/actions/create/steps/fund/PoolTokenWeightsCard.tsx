import { Card, CardBody, HStack, Text, VStack } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { BullseyeIcon } from '@repo/lib/shared/components/icons/BullseyeIcon'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'

export function PoolTokenWeightsCard() {
  const { poolTokens } = usePoolCreationForm()
  const { usdValueForTokenAddress } = useTokens()

  const tokenInputUsdValues = poolTokens.map(token => {
    const { data, address, amount } = token
    if (!address || !data) return { symbol: '', inputUsdValue: 0 }
    const { chain, symbol } = data
    const inputUsdValue = Number(usdValueForTokenAddress(address, chain, amount))
    return { symbol, inputUsdValue }
  })

  const totalInputUsdValue = tokenInputUsdValues.reduce(
    (acc, token) => acc + token.inputUsdValue,
    0
  )

  return (
    <Card>
      <CardBody>
        <VStack>
          <HStack justify="space-between" w="full">
            {tokenInputUsdValues.map((token, idx) => {
              return (
                <Text key={idx}>
                  {token.symbol}: {((token.inputUsdValue * 100) / totalInputUsdValue).toFixed(2)}%
                </Text>
              )
            })}
          </HStack>
          <HStack justify="space-between" w="full">
            {poolTokens.map((token, idx) => {
              return (
                <HStack align="center" key={idx}>
                  <BullseyeIcon />
                  <Text color="font.secondary">{token.weight}%</Text>
                </HStack>
              )
            })}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
