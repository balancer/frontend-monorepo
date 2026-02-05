import { VStack, HStack, Text, CardBody, Divider, Icon } from '@chakra-ui/react'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { CheckCircle, XCircle } from 'react-feather'
import { PoolCreationForm } from '../types'
import { CardHeaderRow, CardDataRow, IdentifyTokenCell, DefaultDataRow } from './PreviewCardRows'
import { zeroAddress, Address } from 'viem'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PreviewPoolCreationCard } from './PreviewPoolCreationCard'
import { TokenMissingPriceWarning } from '@repo/lib/modules/tokens/TokenMissingPriceWarning'
import { usePoolTokenPriceWarnings } from '@repo/lib/modules/pool/usePoolTokenPriceWarnings'
import { useWatch } from 'react-hook-form'

export function PreviewPoolTokens() {
  const { poolCreationForm } = usePoolCreationForm()
  const poolTokens = useWatch({ control: poolCreationForm.control, name: 'poolTokens' })
  const { priceFor } = useTokens()
  const { toCurrency } = useCurrency()
  const { tokenPriceTip } = usePoolTokenPriceWarnings()

  const hasRateProviders = poolTokens.some(token => token.rateProvider !== zeroAddress)

  return (
    <PreviewPoolCreationCard stepTitle="Tokens">
      <CardHeaderRow columnNames={['Tokens', 'Price', 'Market cap']} />
      <CardBody>
        <VStack spacing="md">
          {poolTokens.map((token, idx) => {
            if (!token.address || !token.data) return <DefaultDataRow key={idx} />
            const { address, chain, symbol, name } = token.data

            const tokenUsdValue = token.usdPrice || priceFor(address, chain)
            const tokenPriceDisplay = toCurrency(tokenUsdValue, { abbreviated: false })

            return (
              <CardDataRow
                data={[
                  <IdentifyTokenCell address={address} chain={chain} name={name} symbol={symbol} />,
                  <HStack justify="end">
                    {tokenUsdValue ? (
                      <Text>{tokenPriceDisplay}</Text>
                    ) : (
                      <TokenMissingPriceWarning message={tokenPriceTip} />
                    )}
                  </HStack>,
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
    </PreviewPoolCreationCard>
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
  const { marketCapTip } = usePoolTokenPriceWarnings()
  const marketCap = totalSupply ? totalSupply * tokenUsdValue : 0

  return (
    <HStack justify="end">
      {marketCap ? (
        <Text>{toCurrency(marketCap, { abbreviated: true })}</Text>
      ) : (
        <TokenMissingPriceWarning message={marketCapTip} />
      )}
    </HStack>
  )
}

function RateProviderRows({ poolTokens }: { poolTokens: PoolCreationForm['poolTokens'] }) {
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

          const hasBeenReviewed = !!(
            'priceRateProviderData' in data &&
            data.priceRateProviderData &&
            data.priceRateProviderData.reviewed &&
            data.priceRateProviderData.address?.toLowerCase() === token.rateProvider.toLowerCase()
          )

          return (
            <CardDataRow
              data={[
                <IdentifyTokenCell
                  address={data.address}
                  chain={data.chain}
                  symbol={data.symbol}
                />,
                <RateProviderReviewedCell hasBeenReviewed={hasBeenReviewed} />,
                <HStack justify="end">
                  <BlockExplorerLink
                    address={token.rateProvider || undefined}
                    chain={data.chain}
                    fontSize="md"
                  />
                </HStack>,
              ]}
              key={data.address}
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
