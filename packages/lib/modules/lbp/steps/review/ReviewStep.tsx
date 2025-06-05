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
                <Image src={projectInfoData.tokenIconUrl} borderRadius="full" />
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
            <Text w="full" fontWeight="bold">{`Project name: ${projectInfoData.name}`}</Text>
            <Text w="full" variant="secondary">{`Network: ${getChainName(chain)}`}</Text>
          </VStack>

          <Text variant="secondary">{projectInfoData.description}</Text>

          <HStack spacing="4" w={{ base: 'full', lg: 'auto' }}>
            <SocialLink
              title={projectInfoData.websiteUrl}
              socialNetwork="website"
              href={projectInfoData.websiteUrl}
            />
            <SocialLink
              title={projectInfoData.xHandle}
              socialNetwork="x"
              href={`https://twitter.com/${projectInfoData.xHandle}`}
            />
            {projectInfoData.discordUrl && (
              <SocialLink
                title={projectInfoData.discordUrl}
                socialNetwork="discord"
                href={projectInfoData.discordUrl}
              />
            )}
          </HStack>
        </VStack>
      </Card>

      <HStack w="full">
        {
          // FIXME: [JUANJO] use localized dates
        }
        <SimpleInfoCard
          title="LBP start time"
          info={format(parseISO(saleStartTime), 'dd/MM/yyyy h:mmaaa')}
        />
        <SimpleInfoCard
          title="LBP end time"
          info={format(parseISO(saleEndTime), 'dd/MM/yyyy h:mmaaa')}
        />
        <SimpleInfoCard
          title="Sale period"
          info={`${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''}`}
        />
      </HStack>

      <Card>
        <CardHeader>
          <Heading size="md">Seed Liquidity</Heading>
        </CardHeader>
        <CardBody>
          <VStack w="full">
            <TokenInfo
              iconURL={projectInfoData.tokenIconUrl}
              symbol={launchTokenMetadata.symbol || ''}
              name={launchTokenMetadata.name || ''}
              amount={Number(launchTokenSeed || 0)}
            />

            <TokenInfo
              iconURL={collateralToken?.logoURI || ''}
              symbol={collateralToken?.symbol || ''}
              name={collateralToken?.name || ''}
              amount={Number(collateralTokenSeed || 0)}
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
