import { VStack, Card, HStack, Text, CardBody, Divider, Icon } from '@chakra-ui/react'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { CheckCircle, XCircle } from 'react-feather'
import { type PoolCreationConfig } from '../constants'
import { CardHeaderRow, CardDataRow, IdentifyTokenCell, DefaultDataRow } from './PreviewCardRows'
import { zeroAddress, Address } from 'viem'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function PreviewPoolTokens({ isBeforeStep }: { isBeforeStep: boolean }) {
  const { poolTokens } = usePoolCreationForm()
  const { usdValueForTokenAddress } = useTokens()
  const { toCurrency } = useCurrency()

  const hasRateProviders = poolTokens.some(token => token.rateProvider !== zeroAddress)

  return (
    <Card opacity={isBeforeStep ? 0.5 : 1}>
      <CardHeaderRow columnNames={['Tokens', 'Price', 'Market Cap']} />
      <CardBody>
        <VStack spacing="md">
          {poolTokens.map((token, idx) => {
            if (!token.address || !token.data) return <DefaultDataRow key={idx} />
            const { address, chain, symbol, name } = token.data

            const tokenUsdValue = usdValueForTokenAddress(address, chain, '1')

            return (
              <CardDataRow
                data={[
                  <IdentifyTokenCell address={address} chain={chain} name={name} symbol={symbol} />,
                  <Text align="right">{toCurrency(tokenUsdValue, { abbreviated: false })}</Text>,
                  <MarketCapValue
                    address={address as Address}
                    chain={chain}
                    tokenUsdValue={Number(tokenUsdValue)}
                  />,
                ]}
                key={address}
              />
            )
          })}
          {hasRateProviders && <RateProviderRows poolTokens={poolTokens} />}
        </VStack>
      </CardBody>
    </Card>
  )
}

interface MarketCapValueProps {
  address: Address
  chain: GqlChain
  tokenUsdValue: number
}

function MarketCapValue({ address, chain, tokenUsdValue }: MarketCapValueProps) {
  const { toCurrency } = useCurrency()
  const { totalSupply } = useTokenMetadata(address, chain)

  const marketCap = totalSupply ? totalSupply * tokenUsdValue : 0

  return <Text align="right">{marketCap ? toCurrency(marketCap, { abbreviated: true }) : '—'}</Text>
}

function RateProviderRows({ poolTokens }: { poolTokens: PoolCreationConfig['poolTokens'] }) {
  return (
    <>
      <Divider />
      <CardDataRow
        data={['Rate providers', 'Reviewed', 'Address'].map((name, idx) => (
          <Text
            align={idx === 0 ? 'left' : 'right'}
            color="font.secondary"
            fontSize="sm"
            key={name}
          >
            {name}
          </Text>
        ))}
      />

      {poolTokens
        .filter(token => token.rateProvider !== zeroAddress)
        .map(token => {
          const { data } = token
          if (!data) return null

          const { address, chain, symbol, priceRateProviderData } = data
          const { reviewed, address: verifiedRateProviderAddress } = priceRateProviderData || {}
          const chosenRateProviderAddress = token.rateProvider

          const rateProviderHasBeenReviewed =
            reviewed &&
            verifiedRateProviderAddress?.toLowerCase() === chosenRateProviderAddress.toLowerCase()

          return (
            <CardDataRow
              data={[
                <IdentifyTokenCell address={address} chain={chain} symbol={symbol} />,
                <RateProviderReviewedCell hasBeenReviewed={rateProviderHasBeenReviewed} />,
                <BlockExplorerLink
                  address={chosenRateProviderAddress || undefined}
                  chain={chain}
                  fontSize="md"
                />,
              ]}
              key={address}
            />
          )
        })}
    </>
  )
}

function RateProviderReviewedCell({ hasBeenReviewed }: { hasBeenReviewed: boolean | undefined }) {
  return (
    <HStack align="center" justifyContent="flex-end">
      {hasBeenReviewed ? (
        <>
          <Text>Yes</Text>
          <Icon as={CheckCircle} color="green.500" size={12} />
        </>
      ) : (
        <>
          <Text>No</Text>
          <Icon as={XCircle} color="red.500" size={12} />
        </>
      )}
    </HStack>
  )
}
