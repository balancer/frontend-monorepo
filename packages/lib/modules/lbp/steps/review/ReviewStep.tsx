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

  const chain = saleStructureForm.watch('selectedChain')
  const launchTokenAddress = saleStructureForm.watch('launchTokenAddress')
  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, chain)
  const launchTokenSeed = saleStructureForm.watch('saleTokenAmount')
  const collateralTokenAddress = saleStructureForm.watch('collateralTokenAddress')
  const collateralToken = getToken(collateralTokenAddress, chain)
  const collateralTokenSeed = saleStructureForm.watch('collateralTokenAmount')
  const collateralTokenPrice = priceFor(collateralTokenAddress, chain)
  const startTime = saleStructureForm.watch('startTime')
  const endTime = saleStructureForm.watch('endTime')
  const daysDiff = differenceInDays(parseISO(endTime), parseISO(startTime))
  const hoursDiff = differenceInHours(parseISO(endTime), parseISO(startTime)) - daysDiff * 24

  const tokenIconURL = projectInfoForm.watch('tokenIconUrl')
  const projectName = projectInfoForm.watch('name')
  const projectDescription = projectInfoForm.watch('description')
  const projectWebsite = projectInfoForm.watch('websiteUrl')
  const projectTwitter = projectInfoForm.watch('xHandle')
  const projectDiscord = projectInfoForm.watch('discordUrl')
  const launchTokenIcon = projectInfoForm.watch('tokenIconUrl')

  return (
    <VStack align="start" w="full">
      <Card>
        <VStack alignItems="start" spacing="6">
          <HStack spacing="5">
            <Circle bg="background.level4" color="font.secondary" shadow="lg" size={24}>
              <VStack>
                <Image src={tokenIconURL} borderRadius="full" />
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
            <Text w="full" fontWeight="bold">{`Project name: ${projectName}`}</Text>
            <Text w="full" variant="secondary">{`Network: ${getChainName(chain)}`}</Text>
          </VStack>

          <Text variant="secondary">{projectDescription}</Text>

          <HStack spacing="4" w={{ base: 'full', lg: 'auto' }}>
            <SocialLink title={projectWebsite} socialNetwork="website" href={projectWebsite} />
            <SocialLink
              title={projectTwitter}
              socialNetwork="x"
              href={`https://twitter.com/${projectTwitter}`}
            />
            {projectDiscord && (
              <SocialLink title={projectDiscord} socialNetwork="discord" href={projectDiscord} />
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
          info={format(parseISO(startTime), 'dd/MM/yyyy h:mmaaa')}
        />
        <SimpleInfoCard
          title="LBP end time"
          info={format(parseISO(endTime), 'dd/MM/yyyy h:mmaaa')}
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
              iconURL={launchTokenIcon}
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
