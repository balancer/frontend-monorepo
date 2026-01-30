import {
  Card,
  CardBody,
  CardHeader,
  Circle,
  Heading,
  HStack,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react'
import { differenceInDays, differenceInHours, format, isValid, parseISO } from 'date-fns'
import { getChainName } from '@repo/lib/config/app.config'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useLbpForm } from '../../LbpFormProvider'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { SimpleInfoCard } from '../SimpleInfoCard'
import { LbpFormAction } from '../../LbpFormAction'
import { TokenInfo } from './TokenInfo'
import { SocialLink } from './SocialLink'
import { OtherSaleDetails } from './OtherSaleDetails'
import { normalizeUrl } from '@repo/lib/shared/utils/urls'
import { useWatch } from 'react-hook-form'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { isDynamicSaleType, isFixedSaleType } from '../../steps/sale-structure/helpers'
import { bn } from '@repo/lib/shared/utils/numbers'

export function ReviewStep() {
  const { getToken, priceFor } = useTokens()
  const { projectInfoForm, saleStructureForm } = useLbpForm()
  const [name, tokenIconUrl, description, websiteUrl, xHandle, discordUrl] = useWatch({
    control: projectInfoForm.control,
    name: ['name', 'tokenIconUrl', 'description', 'websiteUrl', 'xHandle', 'discordUrl'],
  })
  const [
    selectedChain,
    launchTokenAddress,
    saleTokenAmount,
    collateralTokenAddress,
    collateralTokenAmount,
    startDateTime,
    endDateTime,
    fee,
    userActions,
    saleType,
    launchTokenPrice,
  ] = useWatch({
    control: saleStructureForm.control,
    name: [
      'selectedChain',
      'launchTokenAddress',
      'saleTokenAmount',
      'collateralTokenAddress',
      'collateralTokenAmount',
      'startDateTime',
      'endDateTime',
      'fee',
      'userActions',
      'saleType',
      'launchTokenPrice',
    ],
  })

  const chain = selectedChain || PROJECT_CONFIG.defaultNetwork

  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, chain)
  const launchTokenSeed = saleTokenAmount
  const collateralToken = getToken(collateralTokenAddress, chain)
  const collateralTokenPrice = priceFor(collateralTokenAddress, chain)

  const launchTokenPriceFiat =
    collateralTokenPrice && launchTokenPrice
      ? bn(launchTokenPrice).times(collateralTokenPrice)
      : '0'

  const daysDiff = differenceInDays(parseISO(endDateTime), parseISO(startDateTime))
  const hoursDiff =
    differenceInHours(parseISO(endDateTime), parseISO(startDateTime)) - daysDiff * 24

  const isDynamicSale = isDynamicSaleType(saleType)
  const isFixedSale = isFixedSaleType(saleType)

  return (
    <VStack align="start" gap="ms" w="full">
      <Card>
        <VStack alignItems="start" spacing="6">
          <HStack spacing="5">
            <Circle bg="background.level4" color="font.secondary" shadow="lg" size={24}>
              <VStack>
                {tokenIconUrl && <Image borderRadius="full" src={normalizeUrl(tokenIconUrl)} />}
              </VStack>
            </Circle>
            <VStack alignItems="start">
              <Heading size="xl" variant="special">
                {launchTokenMetadata.symbol}
              </Heading>
              <Text variant="secondary">{launchTokenMetadata.name}</Text>
            </VStack>
          </HStack>

          <VStack>
            <Text fontWeight="bold" w="full">{`Project name: ${name}`}</Text>
            <Text variant="secondary" w="full">{`Network: ${getChainName(chain)}`}</Text>
          </VStack>
          <VStack alignItems="start" w="full">
            <Text fontWeight="bold" variant="secondary">
              Project description:
            </Text>
            <Text variant="secondary">{description}</Text>
          </VStack>

          <HStack spacing="4" w={{ base: 'full', lg: 'auto' }}>
            <SocialLink href={websiteUrl} socialNetwork="website" title={websiteUrl} />
            {xHandle && (
              <SocialLink href={`https://x.com/${xHandle}`} socialNetwork="x" title={xHandle} />
            )}
            {discordUrl && (
              <SocialLink href={discordUrl} socialNetwork="discord" title={discordUrl} />
            )}
          </HStack>
        </VStack>
      </Card>

      <HStack alignItems="stretch" gap="ms" w="full">
        {
          // FIXME: [JUANJO] use localized dates
        }
        <SimpleInfoCard
          info={
            isValid(parseISO(startDateTime))
              ? format(parseISO(startDateTime), 'dd/MM/yyyy h:mmaaa')
              : ''
          }
          title="LBP start time"
        />
        <SimpleInfoCard
          info={
            isValid(parseISO(endDateTime))
              ? format(parseISO(endDateTime), 'dd/MM/yyyy h:mmaaa')
              : ''
          }
          title="LBP end time"
        />
        <SimpleInfoCard
          info={`${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''}`}
          title="Sale period"
        />
      </HStack>

      {isDynamicSale && (
        <Card>
          <CardHeader>
            <Heading size="md">Seed liquidity</Heading>
          </CardHeader>
          <CardBody>
            <VStack gap="md" w="full">
              <TokenInfo
                amount={launchTokenSeed}
                iconURL={normalizeUrl(tokenIconUrl)}
                name={launchTokenMetadata.name || ''}
                symbol={launchTokenMetadata.symbol || ''}
              />
              <TokenInfo
                amount={collateralTokenAmount}
                iconURL={collateralToken?.logoURI || ''}
                name={collateralToken?.name || ''}
                symbol={collateralToken?.symbol || ''}
                value={bn(collateralTokenAmount).times(collateralTokenPrice).toString()}
              />
            </VStack>
          </CardBody>
        </Card>
      )}
      {isFixedSale && (
        <>
          <Card>
            <CardHeader>
              <Heading size="md">Token for sale</Heading>
            </CardHeader>
            <CardBody>
              <TokenInfo
                amount={launchTokenSeed}
                iconURL={normalizeUrl(tokenIconUrl)}
                isFixedSale={isFixedSale}
                name={launchTokenMetadata.name || ''}
                symbol={launchTokenMetadata.symbol || ''}
                value={launchTokenPriceFiat.toString()}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <Heading size="md">Collateral token</Heading>
            </CardHeader>
            <CardBody>
              <TokenInfo
                amount={collateralTokenAmount}
                iconURL={collateralToken?.logoURI || ''}
                name={collateralToken?.name || ''}
                showValue={false}
                symbol={collateralToken?.symbol || ''}
              />
            </CardBody>
          </Card>
        </>
      )}

      <OtherSaleDetails
        fee={fee}
        launchTokenSymbol={launchTokenMetadata.symbol || ''}
        lbpText={`${isDynamicSale ? 'Dynamic' : 'Fixed'} Price`}
        userActions={userActions}
      />

      <LbpFormAction />
    </VStack>
  )
}
