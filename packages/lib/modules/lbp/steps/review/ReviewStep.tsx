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
import { differenceInDays, differenceInHours, format, parseISO } from 'date-fns'
import { getChainName } from '@repo/lib/config/app.config'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useLbpForm } from '../../LbpFormProvider'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { SimpleInfoCard } from '../SimpleInfoCard'
import { LbpFormAction } from '../../LbpFormAction'
import { TokenInfo } from './TokenInfo'
import { SocialLink } from './SocialLink'
import { OtherSaleDetails } from './OtherSaleDetails'

export function ReviewStep() {
  const { getToken, priceFor } = useTokens()
  const { projectInfoForm, saleStructureForm } = useLbpForm()
  const projectInfoData = projectInfoForm.watch()
  const saleStructureData = saleStructureForm.watch()

  const chain = saleStructureData.selectedChain
  const launchTokenAddress = saleStructureData.launchTokenAddress
  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, chain)
  const launchTokenSeed = saleStructureData.saleTokenAmount
  const collateralTokenAddress = saleStructureData.collateralTokenAddress
  const collateralToken = getToken(collateralTokenAddress, chain)
  const collateralTokenSeed = saleStructureData.collateralTokenAmount
  const collateralTokenPrice = priceFor(collateralTokenAddress, chain)
  const saleStartTime = saleStructureData.startTime
  const saleEndTime = saleStructureData.endTime
  const daysDiff = differenceInDays(parseISO(saleEndTime), parseISO(saleStartTime))
  const hoursDiff =
    differenceInHours(parseISO(saleEndTime), parseISO(saleStartTime)) - daysDiff * 24

  return (
    <VStack align="start" w="full">
      <Card>
        <VStack alignItems="start" spacing="6">
          <HStack spacing="5">
            <Circle bg="background.level4" color="font.secondary" shadow="lg" size={24}>
              <VStack>
                <Image borderRadius="full" src={projectInfoData.tokenIconUrl} />
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
            <Text fontWeight="bold" w="full">{`Project name: ${projectInfoData.name}`}</Text>
            <Text variant="secondary" w="full">{`Network: ${getChainName(chain)}`}</Text>
          </VStack>

          <Text variant="secondary">{projectInfoData.description}</Text>

          <HStack spacing="4" w={{ base: 'full', lg: 'auto' }}>
            <SocialLink
              href={projectInfoData.websiteUrl}
              socialNetwork="website"
              title={projectInfoData.websiteUrl}
            />
            <SocialLink
              href={`https://twitter.com/${projectInfoData.xHandle}`}
              socialNetwork="x"
              title={projectInfoData.xHandle}
            />
            {projectInfoData.discordUrl && (
              <SocialLink
                href={projectInfoData.discordUrl}
                socialNetwork="discord"
                title={projectInfoData.discordUrl}
              />
            )}
          </HStack>
        </VStack>
      </Card>

      <HStack alignItems="stretch" w="full">
        {
          // FIXME: [JUANJO] use localized dates
        }
        <SimpleInfoCard
          info={format(parseISO(saleStartTime), 'dd/MM/yyyy h:mmaaa')}
          title="LBP start time"
        />
        <SimpleInfoCard
          info={format(parseISO(saleEndTime), 'dd/MM/yyyy h:mmaaa')}
          title="LBP end time"
        />
        <SimpleInfoCard
          info={`${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''}`}
          title="Sale period"
        />
      </HStack>

      <Card>
        <CardHeader>
          <Heading size="md">Seed Liquidity</Heading>
        </CardHeader>
        <CardBody>
          <VStack w="full">
            <TokenInfo
              amount={Number(launchTokenSeed || 0)}
              iconURL={projectInfoData.tokenIconUrl}
              name={launchTokenMetadata.name || ''}
              symbol={launchTokenMetadata.symbol || ''}
            />

            <TokenInfo
              amount={Number(collateralTokenSeed || 0)}
              iconURL={collateralToken?.logoURI || ''}
              name={collateralToken?.name || ''}
              symbol={collateralToken?.symbol || ''}
              value={Number(collateralTokenSeed || 0) * collateralTokenPrice}
            />
          </VStack>
        </CardBody>
      </Card>

      <OtherSaleDetails launchTokenSymbol={launchTokenMetadata.symbol || ''} />

      <LbpFormAction />
    </VStack>
  )
}
