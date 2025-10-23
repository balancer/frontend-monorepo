import { Text, Heading, VStack } from '@chakra-ui/react';
import React from 'react';
import useReliquary from '../../lib/useReliquary';
import { useCurrentStep } from '../../lib/useReliquaryCurrentStep';

interface Props {
    investTypeText: string;
}

interface TitleProps {
    title: string;
    subtitle?: string;
}

export function ReliquaryInvestTitle({ investTypeText }: Props) {
    const { currentStep } = useCurrentStep();
    const { createRelic } = useReliquary();

    function getCurrentStepTitle(currentStep: string | null): TitleProps {
        switch (currentStep) {
            case 'wFTM':
                return {
                    title: 'wFTM',
                    subtitle: 'Approve deposit of wFTM',
                };
            case 'BEETS':
                return {
                    title: 'BEETS',
                    subtitle: 'Approve deposit of BEETS',
                };
            case 'unstake':
                return {
                    title: 'Unstake fBEETS',
                    subtitle: 'From the Beets farm',
                };
            case 'batch-relayer-reliquary':
                return {
                    title: 'Transactions',
                    subtitle: 'Approve deposit, withdraw and claim rewards',
                };
            case 'batch-relayer':
                return {
                    title: 'Relic Creation',
                    subtitle: 'Approve creation of new relics',
                };
            case 'approve-vault':
                return {
                    title: 'Vault',
                    subtitle: 'Approve vault to spend your fBEETS',
                };
            case 'reliquary-migrate':
                return {
                    title: 'Destination relic',
                };
            case 'reliquary-invest':
            default:
                return {
                    title: `${createRelic ? 'Create & d' : 'D'}eposit into a relic`,
                };
        }
    }

    function getTitles() {
        const titles: TitleProps | undefined = getCurrentStepTitle(currentStep);

        return (
            <>
                <Text fontSize="3xl" fontWeight="400">
                    {titles?.title}
                </Text>
                {titles?.subtitle && <Text>{titles.subtitle}</Text>}
            </>
        );
    }

    return (
        <VStack pb="4" spacing="0">
            <Heading size="sm" color="beets.green">
                {investTypeText}
            </Heading>
            {getTitles()}
        </VStack>
    );
}
