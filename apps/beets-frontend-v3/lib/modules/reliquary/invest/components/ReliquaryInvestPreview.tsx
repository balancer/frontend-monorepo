import { Box, StackDivider, VStack } from '@chakra-ui/react';
import { BeetsBox } from '~/components/box/BeetsBox';
import { useReliquaryInvest } from '~/modules/reliquary/invest/lib/useReliquaryInvest';
import { ReliquaryInvestSummary } from '~/modules/reliquary/invest/components/ReliquaryInvestSummary';
import { ReliquaryInvestActions } from '~/modules/reliquary/invest/components/ReliquaryInvestActions';
import TokenRow from '~/components/token/TokenRow';
import React from 'react';
import useReliquary from '~/modules/reliquary/lib/useReliquary';
import { ReliquaryInvestDepositImpact } from './ReliquaryInvestDepositImpact';
import { ReliquaryInvestImage } from './ReliquaryInvestImage';
import { CurrentStepProvider } from '~/modules/reliquary/lib/useReliquaryCurrentStep';
import { ReliquaryInvestTitle } from './ReliquaryInvestTitle';

interface Props {
    onInvestComplete(): void;
    onClose(): void;
}

export function ReliquaryInvestPreview({ onInvestComplete, onClose }: Props) {
    const { selectedInvestTokensWithAmounts } = useReliquaryInvest();
    const { selectedRelic, createRelic } = useReliquary();
    const { totalInvestValue } = useReliquaryInvest();

    return (
        <CurrentStepProvider>
            <VStack spacing="4" width="full">
                <VStack px="4" width="full" spacing="0">
                    <ReliquaryInvestImage />
                    <ReliquaryInvestTitle investTypeText="maBEETS" />
                    <ReliquaryInvestSummary />
                    {!createRelic && selectedRelic && (
                        <ReliquaryInvestDepositImpact
                            totalInvestValue={totalInvestValue}
                            relicId={selectedRelic.relicId}
                        />
                    )}
                    <BeetsBox width="full">
                        <VStack width="full" divider={<StackDivider borderColor="whiteAlpha.200" />} p="2">
                            {selectedInvestTokensWithAmounts.map((token, index) => {
                                return <TokenRow key={token.address} address={token.address} amount={token.amount} />;
                            })}
                        </VStack>
                    </BeetsBox>
                </VStack>
                <ReliquaryInvestActions onInvestComplete={onInvestComplete} onClose={onClose} />
            </VStack>
        </CurrentStepProvider>
    );
}
