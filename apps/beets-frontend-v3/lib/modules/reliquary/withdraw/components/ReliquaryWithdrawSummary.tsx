import { Box, BoxProps, HStack, Skeleton, StackDivider, VStack } from '@chakra-ui/react';
import { InfoButton } from '~/components/info-button/InfoButton';
import { BeetsBox } from '~/components/box/BeetsBox';
import { numberFormatUSDValue } from '~/lib/util/number-formats';
import { useGetTokens } from '~/lib/global/useToken';
import { useReliquaryExitGetBptInForSingleAssetWithdraw } from '~/modules/reliquary/withdraw/lib/useReliquaryExitGetBptInForSingleAssetWithdraw';
import { useReliquaryWithdrawState } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState';
import { CardRow } from '~/components/card/CardRow';

interface Props extends BoxProps {
    totalWithdrawValue: number;
}

export function ReliquaryWithdrawSummary({ totalWithdrawValue, ...rest }: Props) {
    const { selectedWithdrawType, singleAssetWithdraw } = useReliquaryWithdrawState();
    const { formattedPrice } = useGetTokens();

    return (
        <BeetsBox {...rest} p="2">
            <VStack width="full">
                <HStack justifyContent="space-between" width="full">
                    <Box flex="1">Total</Box>
                    <Box>
                        {selectedWithdrawType === 'SINGLE_ASSET' && singleAssetWithdraw
                            ? formattedPrice(singleAssetWithdraw)
                            : null}
                        {selectedWithdrawType === 'PROPORTIONAL' ? numberFormatUSDValue(totalWithdrawValue) : null}
                    </Box>
                </HStack>
            </VStack>
        </BeetsBox>
    );
}
