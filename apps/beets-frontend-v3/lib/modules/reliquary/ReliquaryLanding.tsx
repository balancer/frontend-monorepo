import {
    Badge,
    Box,
    Button,
    Flex,
    getToken,
    Heading,
    HStack,
    Stack,
    Text,
    useDisclosure,
    VStack,
    Grid,
    GridItem,
    Skeleton,
} from '@chakra-ui/react';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { BeetsTokenSonic } from '~/assets/logo/BeetsTokenSonic';
import { FBeetsTokenSonic } from '~/assets/logo/FBeetsTokenSonic';
import { MaBeetsTokenSonic } from '~/assets/logo/MaBeetsTokenSonic';
import Card from '~/components/card/Card';
import { ToastType, useToast } from '~/components/toast/BeetsToast';
import BeetsTooltip from '~/components/tooltip/BeetsTooltip';
import { TokensProvider, useGetTokens } from '~/lib/global/useToken';
import { useUserAccount } from '~/lib/user/useUserAccount';
import { PoolProvider, usePool } from '../pool/lib/usePool';
import DelegateClearButton from './components/DelegateClearButton';
import DelegateSetButton from './components/DelegateSetButton';
import { RelicCarousel } from './components/RelicCarousel';
import ReliquaryConnectWallet from './components/ReliquaryConnectWallet';
import ReliquaryHeroBanner from './components/ReliquaryHeroBanner';
import ReliquaryMigrateModal from './components/ReliquaryMigrateModal';
import ReliquaryGlobalStats from './components/stats/ReliquaryGlobalStats';
import { useDelegation } from './lib/useDelegation';
import { useReliquary } from './ReliquaryProvider';
import { CurrentStepProvider } from './lib/useReliquaryCurrentStep';
import { useOldBeetsBalance } from '~/lib/global/useOldBeetsBalance';
import { BeetsMigration } from '../migrate/BeetsMigration';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { ReliquaryInvestModal } from './invest/ReliquaryInvestModal';

const infoButtonLabelProps = {
    lineHeight: '1rem',
    fontWeight: 'semibold',
    fontSize: 'sm',
    color: 'beets.base.50',
};

export default function ReliquaryLanding() {
    const networkConfig = useNetworkConfig();
    const { getToken } = useGetTokens();
    const { isConnected, isConnecting } = useUserAccount();
    const { showToast } = useToast();
    const { pool } = usePool();
    const { isOpen, onOpen, onClose } = useDisclosure({
        onOpen: () => {
            window.open('https://ftm.beets.fi/mabeets', '_blank');
        },
    });
    const [buttonEnabled, setButtonEnabled] = useState(true);
    const { totalMaBeetsVP, isLoading, relicPositions } = useReliquary();
    const { data: isDelegatedToMDs } = useDelegation();
    const { isLoading: isLoadingOldBeetsBalance, balance: oldBeetsBalance } = useOldBeetsBalance();
    const tokenData = getToken(networkConfig.beets.oldAddress);
    const { isOpen: isOpenMigrateModal, onOpen: onOpenMigrateModal, onClose: onCloseMigrateModal } = useDisclosure();

    useEffect(() => {
        if (!isConnecting) {
            setButtonEnabled(isConnected);
        }
    }, [isConnected]);

    useEffect(() => {
        if (!isOpenMigrateModal && !isLoadingOldBeetsBalance && parseFloat(oldBeetsBalance) > 0) {
            onOpenMigrateModal();
        }
    }, [isLoadingOldBeetsBalance, oldBeetsBalance]);

    const hasRelics = !isLoading && relicPositions.length > 0;
    const hasNoRelics = !isLoading && relicPositions.length === 0;
    const hasNoLzBeets = !isLoadingOldBeetsBalance && parseFloat(oldBeetsBalance) === 0;

    useEffect(() => {
        if (!isOpen && hasNoRelics && hasNoLzBeets) {
            showToast({
                id: 'migrate-sonic',
                type: ToastType.Info,
                content: (
                    <Stack
                        direction={['column', 'row']}
                        spacing="4"
                        alignItems="center"
                        justifyContent={{ base: 'stretch', xl: undefined }}
                    >
                        <Text>BEETS are live on Sonic! If you have maBEETS Fantom, you can migrate to Sonic.</Text>
                        <Button variant="primary" onClick={onOpen} w={{ base: 'full', xl: 'inherit' }}>
                            Fantom App
                        </Button>
                    </Stack>
                ),
            });
        }
    }, [hasNoRelics, hasNoLzBeets]);

    return (
        <>
            <Box mt="10" mb="10">
                <ReliquaryHeroBanner />
            </Box>
            <Flex>
                <Heading
                    size="lg"
                    mb="6"
                    background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
                    backgroundClip="text"
                >
                    Get maBEETS
                </Heading>
                <Box flex="1" />
            </Flex>
            <Stack direction={['column', 'row']} spacing="8" mb="10">
                <Card flex="1" padding="4">
                    <Flex mb="8">
                        <Box flex="1" color="beets.highlight">
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
                                fontWeight="bold"
                                fontSize="xl"
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
                        <Box flex="1" color="beets.highlight">
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
                                fontWeight="bold"
                                fontSize="xl"
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
                        <Box flex="1" color="beets.highlight">
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
                                fontWeight="bold"
                                fontSize="xl"
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
                    <VStack width="full" py="4" spacing="8">
                        {!isConnected && (
                            <VStack minH="200px" justifyContent="center" alignItems="center">
                                <ReliquaryConnectWallet />
                            </VStack>
                        )}
                        {isConnected && (
                            <>
                                <Grid
                                    templateColumns={{ base: '1fr 1fr', lg: 'auto auto auto 1fr' }}
                                    templateAreas={{
                                        base: `"title create"
                                               "vp vp"
                                               "delegate delegate"`,
                                        lg: `"title vp delegate create"`,
                                    }}
                                    w="full"
                                    gap={{ base: '1', lg: '4' }}
                                    alignItems="center"
                                >
                                    <GridItem area="title">
                                        <Heading
                                            size="lg"
                                            background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
                                            backgroundClip="text"
                                        >
                                            My relics
                                        </Heading>
                                    </GridItem>
                                    <GridItem area="vp" mt={{ base: '2', lg: '0' }} w="full">
                                        <BeetsTooltip
                                            noImage
                                            label="This is your current maBEETS Voting Power. Depending on when you level up or invest/withdraw, it might be different to what is shown on the latest vote on Snapshot."
                                        >
                                            {!isLoading ? (
                                                <Badge rounded="md" colorScheme="orange" p="2">
                                                    <Heading textTransform="initial" textAlign="center" size="sm">
                                                        {numeral(totalMaBeetsVP).format('0.000a')} maBEETS voting power
                                                    </Heading>
                                                </Badge>
                                            ) : (
                                                <Skeleton height="24px" />
                                            )}
                                        </BeetsTooltip>
                                    </GridItem>
                                    <GridItem area="delegate" justifySelf="start" mt={{ base: '2', lg: '0' }} w="full">
                                        <BeetsTooltip
                                            noImage
                                            label="Delegate or undelegate your maBEETS voting power to the Music Directors. This only affects the delegation for the Beets space on Snapshot."
                                        >
                                            {isDelegatedToMDs ? <DelegateClearButton /> : <DelegateSetButton />}
                                        </BeetsTooltip>
                                    </GridItem>
                                    <GridItem area="create" justifySelf="end">
                                        <ReliquaryInvestModal
                                            createRelic
                                            activatorProps={{ size: 'md', width: '160px', mx: 'auto' }}
                                            activatorLabel="Create new relic"
                                        />
                                    </GridItem>
                                </Grid>
                                <Box width="full">
                                    <RelicCarousel />
                                </Box>
                            </>
                        )}
                    </VStack>
                    <VStack width="full" py="4" spacing="8" mt={{ base: '32rem', lg: '16' }}>
                        <VStack width="full" alignItems="flex-start">
                            <Flex>
                                <Heading
                                    size="lg"
                                    background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
                                    backgroundClip="text"
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
            <BeetsMigration
                oldBeetsBalance={oldBeetsBalance}
                tokenData={tokenData}
                isOpen={isOpenMigrateModal}
                onClose={onCloseMigrateModal}
            />
        </>
    );
}
