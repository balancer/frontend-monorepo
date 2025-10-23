import { Box, Heading, Skeleton, Text } from '@chakra-ui/react';
import { parseUnits } from 'ethers/lib/utils.js';
import { useState } from 'react';
import { BeetsBox } from '~/components/box/BeetsBox';
import { BeetsSubmitTransactionButton } from '~/components/button/BeetsSubmitTransactionButton';
import TokenRow from '~/components/token/TokenRow';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { useUserTokenBalances } from '~/lib/user/useUserTokenBalances';
import { useUnwrapEth } from '~/lib/util/useUnwrapEth';

export function ReliquarySonicMigrateUnwrapFtm() {
    const [success, setSuccess] = useState(false);
    const { userBalances, isLoading, refetch: refetchUserBalances } = useUserTokenBalances();
    const networkConfig = useNetworkConfig();
    const wftmBalance = userBalances.find((balance) => balance.address === networkConfig.wethAddress)?.amount || '0';
    const unwrapEthQuery = useUnwrapEth();
    const hasWftmBalance = !isLoading && parseUnits(wftmBalance, 18).gt(0);

    return (
        <Box>
            <Heading size="md">3. Unwrap Your FTM</Heading>
            {isLoading ? <Skeleton width="full" height="100px" mt="2" /> : null}
            {success && <Text mb="4">You've successfully unwrapped your FTM. Move on to step #4</Text>}
            {!hasWftmBalance && !success && <Text mb="4">You have no WFTM in this wallet.</Text>}
            {hasWftmBalance && !success && (
                <>
                    <Text mb="4">Convert your wFTM back to native FTM to prepare for the upgrade to S.</Text>

                    <BeetsBox mb="6" p="2">
                        <TokenRow address={networkConfig.wethAddress} amount={wftmBalance} />
                    </BeetsBox>
                    <BeetsSubmitTransactionButton
                        {...unwrapEthQuery}
                        onClick={() => unwrapEthQuery.unwrap(wftmBalance)}
                        onConfirmed={() => {
                            refetchUserBalances();
                            setSuccess(true);
                        }}
                        width="full"
                        size="lg"
                    >
                        {`Unwrap ${networkConfig.eth.symbol}`}
                    </BeetsSubmitTransactionButton>
                </>
            )}
        </Box>
    );
}
