import { VStack, Card, HStack, Text, CardBody, Divider, Icon } from '@chakra-ui/react'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { CheckCircle, XCircle } from 'react-feather'
import { PoolCreationConfig } from '../PoolCreationFormProvider'
import { CardHeaderRow, CardDataRow, IdentifyTokenCell, DefaultDataRow } from './PreviewCardRows'
import { zeroAddress } from 'viem'

export function PoolTokensCard() {
  const { poolTokens } = usePoolCreationForm()
  const { usdValueForTokenAddress } = useTokens()
  const { toCurrency } = useCurrency()

  const hasRateProviders = poolTokens.some(token => token.rateProvider !== zeroAddress)

  return (
    <Card>
      <CardHeaderRow columnNames={['Tokens', 'Price', 'Market Cap']} />
      <CardBody>
        <VStack spacing="md">
          {poolTokens.map((token, idx) => {
            if (!token.address || !token.data) return <DefaultDataRow key={idx} />
            const { address, chain, symbol, name } = token.data

            return (
              <CardDataRow
                data={[
                  <IdentifyTokenCell address={address} chain={chain} name={name} symbol={symbol} />,
                  <Text align="right">
                    {toCurrency(usdValueForTokenAddress(address, chain, '1'), {
                      abbreviated: false,
                    })}
                  </Text>,
                  <Text align="right">???</Text>,
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
