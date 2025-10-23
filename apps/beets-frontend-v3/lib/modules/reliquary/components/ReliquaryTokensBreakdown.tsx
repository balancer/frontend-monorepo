import { Box, BoxProps, HStack, Skeleton, StackDivider, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { useRelicDepositBalance } from '../lib/useRelicDepositBalance';
import { CardRow } from '~/components/card/CardRow';
import { tokenFormatAmount } from '~/lib/services/token/token-util';
import { numberFormatUSDValue } from '~/lib/util/number-formats';
import { useGetTokens } from '~/lib/global/useToken';
import TokenAvatar from '~/components/token/TokenAvatar';
import { useReliquaryWithdrawState } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState';
import { BeetsBox } from '~/components/box/BeetsBox';
import TokenRow from '~/components/token/TokenRow';

interface Props extends BoxProps {
    showTotal?: boolean;
}

export default function ReliquaryTokenBreakdown({ showTotal = false, ...rest }: Props) {
    const { proportionalPercent, selectedWithdrawType } = useReliquaryWithdrawState();
    const { getToken, priceForAmount } = useGetTokens();
    const { data: relicTokenBalances, isLoading } = useRelicDepositBalance();

    const relicTokenBalancesWithSymbol = relicTokenBalances?.map((token) => ({
        ...token,
        symbol: getToken(token.address)?.symbol,
    }));

    const getAmount = (amount: string) =>
        selectedWithdrawType === 'PROPORTIONAL' && !showTotal
            ? ((proportionalPercent / 100) * parseFloat(amount)).toString()
            : amount;

    return (
        <VStack {...rest} width="full" divider={<StackDivider borderColor="whiteAlpha.200" />}>
            {relicTokenBalancesWithSymbol?.map((token) => (
                <TokenRow key={token.address} address={token.address} amount={getAmount(token.amount)} />
            ))}
        </VStack>
    );
}
