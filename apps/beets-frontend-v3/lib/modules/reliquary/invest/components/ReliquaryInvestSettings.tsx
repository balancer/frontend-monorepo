import { InfoButton } from '~/components/info-button/InfoButton';
import { Box, BoxProps, HStack, Skeleton, VStack, Text } from '@chakra-ui/react';
import { BeetsBox } from '~/components/box/BeetsBox';
import { SlippageTextLinkMenu } from '~/components/slippage/SlippageTextLinkMenu';
import React from 'react';
import { useReliquaryJoinGetBptOutAndPriceImpactForTokensIn } from '../lib/useReliquaryJoinGetBptOutAndPriceImpactForTokensIn';

export function ReliquaryInvestSettings({ ...rest }: BoxProps) {
    const { formattedPriceImpact, hasHighPriceImpact, hasMediumPriceImpact, isLoading } =
        useReliquaryJoinGetBptOutAndPriceImpactForTokensIn();

    return (
        <Box {...rest} width="full">
            <BeetsBox p="2" width="full">
                <VStack width="full">
                    <HStack
                        width="full"
                        justifyContent="space-between"
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
                        <InfoButton
                            label="Price impact"
                            infoText="This is the difference between the current market price and the price you will pay due to your investment influencing the balance and internal price of tokens within the pool."
                        />
                        {isLoading ? (
                            <Skeleton h="3" w="12" />
                        ) : (
                            <Text fontSize=".85rem" color={hasMediumPriceImpact ? 'orange' : 'white'}>
                                {formattedPriceImpact}
                            </Text>
                        )}
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
