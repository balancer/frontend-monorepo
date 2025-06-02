'use client'

import {
  VStack,
  Heading,
  Card,
  CardHeader,
  HStack,
  GridItem,
  Grid,
  Image,
  CardBody,
  Text,
  Circle,
  Button,
  Flex,
  Spacer,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Divider,
} from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useLbpForm } from './LbpFormProvider'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { Plus } from 'react-feather'
import { LearnMoreModal } from './header/LearnMoreModal'
import { Controller } from 'react-hook-form'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { WeightsChart } from './steps/sale-structure/WeightsChart'
import { differenceInDays, differenceInHours, parseISO } from 'date-fns'
import { useTokens } from '../tokens/TokensProvider'
import { ProjectedPriceChart } from './steps/sale-structure/ProjectedPriceChart'
import { useState } from 'react'

export function LbpPreview() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { getToken, priceFor } = useTokens()

  const {
    saleStructureForm: { watch },
  } = useLbpForm()

  const {
    projectInfoForm: {
      control,
      formState: { errors },
      watch: watchInfo,
    },
  } = useLbpForm()

  const chain = watch('selectedChain')
  const launchTokenAddress = watch('launchTokenAddress')
  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, chain)
  const launchTokenSeed = watch('saleTokenAmount')
  const tokenIconURL = watchInfo('tokenIconUrl')

  const collateralTokenAddress = watch('collateralTokenAddress')
  const collateralToken = getToken(collateralTokenAddress, chain)
  const collateralTokenSeed = watch('collateralTokenAmount')

  const weightAdjustmentType = watch('weightAdjustmentType')
  const startWeight = ['linear_90_10', 'linear_90_50'].includes(weightAdjustmentType)
    ? 90
    : watch('customStartWeight')
  const endWeight =
    weightAdjustmentType === 'linear_90_10'
      ? 10
      : weightAdjustmentType === 'linear_90_50'
        ? 50
        : watch('customEndWeight')

  const startTime = watch('startTime')
  const endTime = watch('endTime')
  const daysDiff = differenceInDays(parseISO(endTime), parseISO(startTime))
  const hoursDiff = differenceInHours(parseISO(endTime), parseISO(startTime)) - daysDiff * 24
  const salePeriodText =
    startTime && endTime
      ? `Sale period: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''}`
      : ''

  const [maxPrice, setMaxPrice] = useState('')
  const updateMaxPrice = (prices: number[][]) => {
    const maxPrice = Math.max(...prices.map(point => point[1]))
    setMaxPrice(fNum('fiat', maxPrice))
  }

  return (
    <>
      <NoisyCard
        cardProps={{
          w: 'full',
          overflow: 'hidden',
        }}
      >
        <VStack align="start" p="lg" spacing="lg" w="full">
          <Flex w="full">
            <Heading color="font.maxContrast" size="md">
              LBP Preview
            </Heading>
            <Spacer />
            <Button
              _hover={{ color: 'font.linkHover' }}
              color="font.link"
              position="relative"
              top="4px"
              variant="ghost"
              onClick={onOpen}
            >
              Get help
            </Button>
          </Flex>
          <Card>
            <CardHeader>
              <HStack justify="space-between" w="full">
                <Heading size="sm">Token summary</Heading>
                <NetworkIcon bg="background.level4" chain={chain} shadow="lg" size={8} />
              </HStack>
            </CardHeader>
            <CardBody>
              <Grid gap={0} templateColumns="1fr 1fr">
                <GridItem borderRightColor="background.level0" borderRightWidth="1px" pr="md">
                  <HStack spacing="md">
                    <Popover placement="top" trigger="click">
                      <PopoverTrigger>
                        <Circle
                          bg="background.level4"
                          color="font.secondary"
                          shadow="lg"
                          size={24}
                          role="button"
                        >
                          <VStack>
                            {tokenIconURL ? (
                              <Image src={tokenIconURL} borderRadius="full" />
                            ) : (
                              <Plus />
                            )}
                          </VStack>
                        </Circle>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow bg="background.level3" />
                        <PopoverHeader color="font.primary">Token logo URL</PopoverHeader>
                        <PopoverBody>
                          <Controller
                            control={control}
                            name="tokenIconUrl"
                            render={({ field }) => (
                              <InputWithError
                                error={errors.tokenIconUrl?.message}
                                isInvalid={!!errors.tokenIconUrl}
                                onChange={e => field.onChange(e.target.value)}
                                placeholder="https://yourdomain.com/token-icon.svg"
                                value={field.value}
                              />
                            )}
                          />
                          <Text color="font.secondary" fontSize="sm">
                            Ideally SVG (or PNG / JPG)
                          </Text>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                    <VStack align="start" spacing="xs">
                      <Text fontSize="xl" fontWeight="bold">
                        {launchTokenMetadata?.symbol ?? 'Token symbol'}
                      </Text>
                      <Text>{launchTokenMetadata?.name ?? 'Token name'}</Text>
                    </VStack>
                  </HStack>
                </GridItem>
                <GridItem borderLeftColor="background.level4" borderLeftWidth="1px" pl="md">
                  <Grid templateColumns="1fr 1fr">
                    <GridItem>
                      <VStack align="start">
                        <Text color="font.secondary">Holders:</Text>
                        <Text color="font.secondary">Total supply:</Text>
                        <Text color="font.secondary">Creation date:</Text>
                        <Text color="font.secondary">Creation wallet:</Text>
                      </VStack>
                    </GridItem>
                    <GridItem>
                      <VStack align="start">
                        <Text>???</Text>
                        <Text>
                          {launchTokenMetadata?.totalSupply
                            ? fNum('token', launchTokenMetadata?.totalSupply)
                            : '-'}
                        </Text>
                        <Text>???</Text>
                        <Text>???</Text>
                      </VStack>
                    </GridItem>
                  </Grid>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          <Card h="450px">
            <CardHeader>
              <HStack>
                <Heading size="sm">LBP pool weight shifts</Heading>
                <Spacer />
                <Text color="font.secondary" fontWeight="bold">
                  Standard linear
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <WeightsChart
                startWeight={startWeight}
                endWeight={endWeight}
                startDate={parseISO(startTime)}
                endDate={parseISO(endTime)}
              />

              <Divider />

              <HStack mt="2">
                <Text color="font.special" fontWeight="extrabold">
                  &mdash;
                </Text>
                <Text>{launchTokenMetadata.symbol}</Text>
                <Text color="#93C6FF" fontWeight="extrabold">
                  &mdash;
                </Text>
                <Text>{collateralToken?.symbol}</Text>
                <Spacer />
                <Text color="font.secondary" fontSize="sm">
                  {salePeriodText}
                </Text>
              </HStack>
            </CardBody>
          </Card>

          <Card h="450px">
            <CardHeader>
              <HStack>
                <Heading size="sm">Projected price</Heading>
                <Spacer />
                <Text color="font.secondary" fontWeight="bold">
                  {`Starting price: $${maxPrice}`}
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <ProjectedPriceChart
                startWeight={startWeight}
                endWeight={endWeight}
                startDate={parseISO(startTime)}
                endDate={parseISO(endTime)}
                launchTokenSeed={Number(launchTokenSeed || 0)}
                collateralTokenSeed={Number(collateralTokenSeed || 0)}
                collateralTokenPrice={priceFor(collateralTokenAddress, chain)}
                onPriceChange={updateMaxPrice}
              />

              <Divider />

              <HStack mt="2">
                <hr
                  style={{
                    width: '15px',
                    border: '1px dashed',
                    borderColor: 'linear-gradient(90deg, #194D05 0%, #30940A 100%)',
                  }}
                />
                <Text>{`${launchTokenMetadata.symbol} projected price (if no demand)`}</Text>
                <Spacer />
                <Text color="font.secondary" fontSize="sm">
                  {salePeriodText}
                </Text>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </NoisyCard>

      <LearnMoreModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
