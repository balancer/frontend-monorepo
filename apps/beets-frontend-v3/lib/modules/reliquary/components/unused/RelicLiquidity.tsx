import { Box, Button, HStack, Spacer, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import Card from '~/components/card/Card';
import { numberFormatUSDValue } from '~/lib/util/number-formats';
import { useRelicDepositBalance } from '../../lib/useRelicDepositBalance';
import TokenAvatar from '~/components/token/TokenAvatar';
import { useGetTokens } from '~/lib/global/useToken';
import { tokenFormatAmount } from '~/lib/services/token/token-util';
import { ReliquaryInvestModal } from '~/modules/reliquary/invest/ReliquaryInvestModal';

export default function RelicLiquidity() {
    const { data: relicTokenBalances, relicBalanceUSD } = useRelicDepositBalance();
    const { getToken } = useGetTokens();

    const relicTokenBalancesWithSymbol = relicTokenBalances?.map((token) => ({
        ...token,
        symbol: getToken(token.address)?.symbol,
    }));

    return (
        <Card px="2" py="4" h="full">
            <VStack spacing="0" alignItems="flex-start" h="full">
                <Text lineHeight="1rem" fontWeight="semibold" fontSize="sm" color="beets.base.50">
                    Relic liquidity
                </Text>
                <Text color="white" fontSize="1.75rem">
                    {numberFormatUSDValue(relicBalanceUSD)}
                </Text>
                <HStack>
                    {relicTokenBalancesWithSymbol?.map((token, index) => (
                        <Box key={index}>
                            <HStack spacing="1" mb="0.5">
                                <TokenAvatar h="20px" w="20px" address={token.address} />
                                <Text fontSize="1rem" lineHeight="1rem">
                                    {tokenFormatAmount(token.amount)}
                                </Text>
                                <Text fontSize="1rem" lineHeight="1rem">
                                    {token.symbol}
                                </Text>
                                {index === 0 ? <Text>&nbsp;/</Text> : undefined}
                            </HStack>
                        </Box>
                    ))}
                </HStack>
                <Spacer />
                <HStack w="full">
                    <ReliquaryInvestModal createRelic={false} />
                    <Button w="full" variant="secondary">
                        Withdraw
                    </Button>
                </HStack>
            </VStack>
        </Card>
    );
}
