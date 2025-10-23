import { Box, Flex, Heading, Link, Skeleton, Text } from '@chakra-ui/react';
import { parseUnits } from 'ethers/lib/utils.js';
import { useEffect, useState } from 'react';
import { ExternalLink } from 'react-feather';
import { BeetsTransactionStepsSubmit, TransactionStep } from '~/components/button/BeetsTransactionStepsSubmit';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { TokenBaseWithAmount } from '~/lib/services/token/token-types';
import { useUserTokenBalances } from '~/lib/user/useUserTokenBalances';
import { etherscanGetAddressUrl } from '~/lib/util/etherscan';
import { useUserAllowances } from '~/lib/util/useUserAllowances';
import { beetsOftProxy, useBridgeBeets } from '../../lib/useBridgeBeets';
import { useUserAccount } from '~/lib/user/useUserAccount';

export function ReliquarySonicMigrateBridgeBeets() {
    const { userAddress } = useUserAccount();
    const networkConfig = useNetworkConfig();
    const [success, setSuccess] = useState(false);
    const [steps, setSteps] = useState<TransactionStep[] | null>(null);
    const { userBalances, isLoading, refetch: refetchUserBalances } = useUserTokenBalances();
    const beetsBalance = userBalances.find((balance) => balance.address === networkConfig.beets.address)?.amount || '0';
    const hasBeetsBalance = parseUnits(beetsBalance, 18).gt(0);
    const beetsTokenWithBalance: TokenBaseWithAmount = {
        address: networkConfig.beets.address,
        amount: beetsBalance,
        name: 'Beethoven X',
        symbol: 'BEETS',
        decimals: 18,
    };

    const { bridge, ...bridgeQuery } = useBridgeBeets();

    const {
        hasApprovalForAmount,
        isLoading: isLoadingAllowances,
        refetch: refetchUserAllowances,
    } = useUserAllowances([beetsTokenWithBalance], beetsOftProxy);

    useEffect(() => {
        const _steps: TransactionStep[] = [];

        if (!isLoadingAllowances) {
            if (!hasApprovalForAmount(beetsTokenWithBalance.address, beetsTokenWithBalance.amount)) {
                _steps.push({
                    id: 'approve',
                    type: 'tokenApproval',
                    buttonText: `Approve BEETS`,
                    tooltipText: `Approve BEETS for bridging`,
                    token: beetsTokenWithBalance,
                    contractToApprove: beetsOftProxy,
                });
            }

            _steps.push({
                id: 'bridge',
                type: 'other',
                buttonText: 'Bridge BEETS and receive lzBEETS on Sonic',
                tooltipText: 'Bridge BEETS and receive lzBEETS on Sonic',
            });

            setSteps(_steps);
        }
    }, [isLoadingAllowances]);

    return (
        <Box>
            <Heading size="md">2. Bridge your BEETS on Fantom for lzBEETS on Sonic</Heading>
            {isLoading && <Skeleton height="100px" width="full" mt="2" />}
            {success && (
                <>
                    <Text mb="2">
                        You've started the bridging of your BEETES to lzBEETS on Sonic. You can check the bridge
                        transaction status on LayerZeroScan. Once complete, you can move on to step #3.
                    </Text>
                    <Box mb="4">
                        <Link href={`https://layerzeroscan.com/address/${userAddress}`} target="_blank">
                            <Flex alignItems="center">
                                <Text mr="1">LayerZeroScan</Text>
                                <ExternalLink size={16} />
                            </Flex>
                        </Link>
                    </Box>
                </>
            )}
            {!hasBeetsBalance && !isLoading && !success && (
                <>
                    <Text mb="2">You don't have any BEETS to bridge.</Text>
                    <Text mb="2">
                        If you've already bridged your BEETS, you can check the bridge transaction status on
                        LayerZeroScan.
                    </Text>
                    <Box mb="4">
                        <Link href={`https://layerzeroscan.com/address/${userAddress}`} target="_blank">
                            <Flex alignItems="center">
                                <Text mr="1">LayerZeroScan</Text>
                                <ExternalLink size={16} />
                            </Flex>
                        </Link>
                    </Box>
                </>
            )}
            {hasBeetsBalance && !isLoading && !success && (
                <>
                    <Text mb="2">
                        Transfer your Fantom BEETS to lzBEETS via the LayerZero bridge. You'll be interacting with the
                        BEETSProxyOFTv2 contract. Please verify the address in all transactions.
                    </Text>
                    <Box mb="4">
                        <Link href={etherscanGetAddressUrl(beetsOftProxy)} target="_blank">
                            <Flex alignItems="center">
                                <Text mr="1"> BeetsProxyOFTV2: {beetsOftProxy}</Text>
                                <ExternalLink size={16} />
                            </Flex>
                        </Link>
                    </Box>

                    <Text mb="2">
                        <Text display="inline" fontWeight="bold">
                            Note
                        </Text>
                        : The BEETS will be sent to the same wallet address on Sonic. If you're using a multisig wallet
                        or any other non EOA, please wait for the stargate UI to come online.
                    </Text>

                    <Text mb="2">Once done you can check the bridge transaction status on LayerZeroScan.</Text>
                    <Box mb="4">
                        <Link href={`https://layerzeroscan.com/address/${userAddress}`} target="_blank">
                            <Flex alignItems="center">
                                <Text mr="1">LayerZeroScan</Text>
                                <ExternalLink size={16} />
                            </Flex>
                        </Link>
                    </Box>

                    <BeetsTransactionStepsSubmit
                        isLoading={steps === null}
                        loadingButtonText="Bridge BEETS"
                        completeButtonText="Bridging complete"
                        onCompleteButtonClick={() => {}}
                        steps={steps || []}
                        onSubmit={() => {
                            bridge(beetsTokenWithBalance.amount);
                        }}
                        onConfirmed={(id) => {
                            if (id !== 'bridge') {
                                refetchUserAllowances();
                            } else {
                                refetchUserBalances();
                                setSuccess(true);
                            }
                        }}
                        queries={[{ ...bridgeQuery, id: 'bridge' }]}
                    />
                </>
            )}
        </Box>
    );
}
