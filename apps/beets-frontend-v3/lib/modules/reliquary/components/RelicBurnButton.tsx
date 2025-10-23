import { HStack, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { BeetsSubmitTransactionButton } from '~/components/button/BeetsSubmitTransactionButton';
import { ToastType, useToast } from '~/components/toast/BeetsToast';
import useReliquary from '../lib/useReliquary';
import { useRelicBurn } from '../lib/useRelicBurn';

interface Props {
    size?: string;
    rounded?: string;
    w?: string;
}

export default function RelicBurnButton({ ...rest }: Props) {
    const { selectedRelic, refetchRelicPositions, refetchMaturityThresholds } = useReliquary();
    const { burn, ...burnQuery } = useRelicBurn();
    const { showToast } = useToast();

    useEffect(() => {
        if (burnQuery.submitError) {
            showToast({
                id: 'burn-error',
                auto: true,
                type: ToastType.Error,
                content: (
                    <HStack>
                        <Text>{burnQuery.submitError.message}</Text>
                    </HStack>
                ),
            });
        }
    }, [burnQuery.submitError]);

    if (!selectedRelic) return null;

    return (
        <BeetsSubmitTransactionButton
            inline
            submittingText="Confirm..."
            pendingText="Waiting..."
            onClick={() => burn(selectedRelic.relicId)}
            onConfirmed={() => {
                refetchRelicPositions();
            }}
            {...burnQuery}
            {...rest}
        >
            Burn
        </BeetsSubmitTransactionButton>
    );
}
