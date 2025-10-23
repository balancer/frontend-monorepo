import { InfoButton } from '~/components/info-button/InfoButton';
import { Box, BoxProps, HStack, Skeleton, VStack } from '@chakra-ui/react';
import { BeetsBox } from '~/components/box/BeetsBox';
import { SlippageTextLinkMenu } from '~/components/slippage/SlippageTextLinkMenu';
import { useReliquaryExitGetBptInForSingleAssetWithdraw } from '../lib/useReliquaryExitGetBptInForSingleAssetWithdraw';
import { useReliquaryWithdrawState } from '../lib/useReliquaryWithdrawState';

export function ReliquaryWithdrawSettings({ ...rest }: BoxProps) {
    const {
        hasHighPriceImpact,
        hasMediumPriceImpact,
        formattedPriceImpact,
        isLoading: isLoadingSingleAsset,
    } = useReliquaryExitGetBptInForSingleAssetWithdraw();

    const { selectedWithdrawType, singleAssetWithdraw } = useReliquaryWithdrawState();

    return (
        <Box {...rest}>
            <BeetsBox p="2">
                <VStack width="full">
                    <HStack
                        justifyContent="space-between"
                        width="full"
                        style={
                            hasHighPriceImpact
                                ? {
                                      color: 'white',
                                      fontWeight: 'bold',
                                      backgroundColor: 'red',
                                      borderRadius: '4px',
                                      padding: '0px 4px 2px 4px',
                                  }
                                : {}
                        }
                    >
                        <Box flex="1">
                            <InfoButton
                                label="Price impact"
                                infoText="This is the difference between the current market price and the price you will pay due to your withdraw influencing the balance and internal price of tokens within the pool."
                            />
                        </Box>
                        <Box>
                            {selectedWithdrawType === 'PROPORTIONAL' ? (
                                <Box>0.00%</Box>
                            ) : isLoadingSingleAsset ? (
                                <Skeleton height="20px" width="64px" mb="4px" />
                            ) : (
                                <Box color={hasMediumPriceImpact ? 'orange' : 'current'}>{formattedPriceImpact}</Box>
                            )}
                        </Box>
                    </HStack>
                    <HStack justifyContent="space-between" width="full">
                        <Box flex="1">
                            <InfoButton
                                label="Max slippage"
                                infoText="The maximum amount of slippage that you're willing to accept for this transaction."
                            />
                        </Box>
                        <SlippageTextLinkMenu />
                    </HStack>
                </VStack>
            </BeetsBox>
        </Box>
    );
}
