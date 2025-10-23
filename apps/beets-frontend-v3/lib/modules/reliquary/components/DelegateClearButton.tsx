import { HStack, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { BeetsSubmitTransactionButton } from '~/components/button/BeetsSubmitTransactionButton';
import { ToastType, useToast } from '~/components/toast/BeetsToast';
import { useDelegateClear } from '../lib/useDelegateClear';
import { useDelegation } from '../lib/useDelegation';

interface Props {
    size?: string;
    rounded?: string;
    w?: string;
}

export default function DelegateClearButton({ ...rest }: Props) {
    // TODO combine into one hook?
    const { clearDelegate, ...clearDelegateQuery } = useDelegateClear();
    const { refetch } = useDelegation();
    const { showToast } = useToast();

    useEffect(() => {
        if (clearDelegateQuery.submitError) {
            showToast({
                id: 'clearDelegate-error',
                auto: true,
                type: ToastType.Error,
                content: (
                    <HStack>
                        <Text>{clearDelegateQuery.submitError.message}</Text>
                    </HStack>
                ),
            });
        }
    }, [clearDelegateQuery.submitError]);

    return (
        <BeetsSubmitTransactionButton
            inline
            submittingText="Confirm..."
            pendingText="Waiting..."
            onClick={() => clearDelegate()}
            onConfirmed={() => refetch()}
            {...clearDelegateQuery}
            {...rest}
        >
            Undelegate from vote optimizer
        </BeetsSubmitTransactionButton>
    );
}
