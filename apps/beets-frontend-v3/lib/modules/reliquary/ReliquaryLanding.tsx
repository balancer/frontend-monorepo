import {
  Badge,
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  VStack,
  Grid,
  GridItem,
  Skeleton,
  Tooltip,
  Card,
} from '@chakra-ui/react'
import { BeetsTokenSonic } from './assets/BeetsTokenSonic'
import { FBeetsTokenSonic } from './assets/FBeetsTokenSonic'
import { MaBeetsTokenSonic } from './assets/MaBeetsTokenSonic'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import DelegateClearButton from './components/DelegateClearButton'
import DelegateSetButton from './components/DelegateSetButton'
import { RelicCarousel } from './components/RelicCarousel'
import ReliquaryConnectWallet from './components/ReliquaryConnectWallet'
import ReliquaryHeroBanner from './components/ReliquaryHeroBanner'
import ReliquaryGlobalStats from './components/stats/ReliquaryGlobalStats'
import { useDelegation } from './lib/useDelegation'
import { useReliquary } from './ReliquaryProvider'
import { ReliquaryInvestModal } from './invest/ReliquaryInvestModal'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'

export default function ReliquaryLanding() {
  const { isConnected } = useUserAccount()
  const { totalMaBeetsVP, isLoading } = useReliquary()
  const { data: isDelegatedToMDs } = useDelegation()

  return (
    <>
      <Box mb="10" mt="10">
        <ReliquaryHeroBanner />
      </Box>
      <Flex>
        <Heading
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          mb="6"
          size="lg"
        >
          Get maBEETS
        </Heading>
        <Box flex="1" />
      </Flex>
      <Stack direction={['column', 'row']} mb="10" spacing="8">
        <Card flex="1" padding="4">
          <Flex mb="8">
            <Box color="beets.highlight" flex="1">
              Step1
            </Box>
            <Box>
              <BeetsTokenSonic />
            </Box>
          </Flex>
          <Flex mb="2">
            <Box>
              <Text
                background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
                backgroundClip="text"
                fontSize="xl"
                fontWeight="bold"
              >
                fBEETS
              </Text>
            </Box>
            <Box flex="1" />
          </Flex>
          <Box>Invest BEETS/stS (80/20) into the Fresh BEETS pool to receive fBEETS.</Box>
        </Card>
        <Card flex="1" padding="4">
          <Flex mb="8">
            <Box color="beets.highlight" flex="1">
              Step2
            </Box>
            <Box>
              <FBeetsTokenSonic />
            </Box>
          </Flex>
          <Flex mb="2">
            <Box>
              <Text
                background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
                backgroundClip="text"
                fontSize="xl"
                fontWeight="bold"
              >
                Reliquary
              </Text>
            </Box>
            <Box flex="1" />
          </Flex>
          <Box>Deposit fBEETS into Reliquary to unlock your maturity adjusted position.</Box>
        </Card>
        <Card flex="1" padding="4">
          <Flex mb="8">
            <Box color="beets.highlight" flex="1">
              Step3
            </Box>
            <Box>
              <MaBeetsTokenSonic />
            </Box>
          </Flex>
          <Flex mb="2">
            <Box>
              <Text
                background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
                backgroundClip="text"
                fontSize="xl"
                fontWeight="bold"
              >
                maBEETS
              </Text>
            </Box>
            <Box flex="1" />
          </Flex>
          <Box>Receive a transferable and composable Relic that holds your maBEETS position.</Box>
        </Card>
      </Stack>
      <Stack direction="column" width="full">
        <Box width="full">
          <VStack py="4" spacing="8" width="full">
            {!isConnected && (
              <VStack alignItems="center" justifyContent="center" minH="200px">
                <ReliquaryConnectWallet />
              </VStack>
            )}
            {isConnected && (
              <>
                <Grid
                  alignItems="center"
                  gap={{ base: '1', lg: '4' }}
                  templateAreas={{
                    base: `"title create"
                                               "vp vp"
                                               "delegate delegate"`,
                    lg: `"title vp delegate create"`,
                  }}
                  templateColumns={{ base: '1fr 1fr', lg: 'auto auto auto 1fr' }}
                  w="full"
                >
                  <GridItem area="title">
                    <Heading
                      background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
                      backgroundClip="text"
                      size="lg"
                    >
                      My relics
                    </Heading>
                  </GridItem>
                  <GridItem area="vp" mt={{ base: '2', lg: '0' }} w="full">
                    <Tooltip label="This is your current maBEETS Voting Power. Depending on when you level up or invest/withdraw, it might be different to what is shown on the latest vote on Snapshot.">
                      {!isLoading ? (
                        <Badge colorScheme="orange" p="2" rounded="md">
                          <Heading size="sm" textAlign="center" textTransform="initial">
                            {fNumCustom(totalMaBeetsVP, '0.000a')} maBEETS voting power
                          </Heading>
                        </Badge>
                      ) : (
                        <Skeleton height="24px" />
                      )}
                    </Tooltip>
                  </GridItem>
                  <GridItem
                    area="delegate"
                    justifySelf="start"
                    mt={{ base: '2', lg: '0' }}
                    w="full"
                  >
                    <Tooltip label="Delegate or undelegate your maBEETS voting power to the Music Directors. This only affects the delegation for the Beets space on Snapshot.">
                      {isDelegatedToMDs ? <DelegateClearButton /> : <DelegateSetButton />}
                    </Tooltip>
                  </GridItem>
                  <GridItem area="create" justifySelf="end">
                    {/* <ReliquaryInvestModal
                      activatorLabel="Create new relic"
                      activatorProps={{ size: 'md', width: '160px', mx: 'auto' }}
                      createRelic
                    /> */}
                  </GridItem>
                </Grid>
                <Box width="full">
                  <RelicCarousel />
                </Box>
              </>
            )}
          </VStack>
          <VStack mt={{ base: '32rem', lg: '16' }} py="4" spacing="8" width="full">
            <VStack alignItems="flex-start" width="full">
              <Flex>
                <Heading
                  background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
                  backgroundClip="text"
                  size="lg"
                >
                  All relics
                </Heading>
                <Box flex="1" />
              </Flex>
            </VStack>
            <ReliquaryGlobalStats />
          </VStack>
        </Box>
      </Stack>
    </>
  )
}
