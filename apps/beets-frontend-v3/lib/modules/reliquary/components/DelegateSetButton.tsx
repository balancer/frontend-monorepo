import { HStack, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { BeetsSubmitTransactionButton } from '~/components/button/BeetsSubmitTransactionButton';
import { ToastType, useToast } from '~/components/toast/BeetsToast';
import { useDelegateSet } from '../lib/useDelegateSet';
import { useDelegation } from '../lib/useDelegation';

interface Props {
    size?: string;
    rounded?: string;
    w?: string;
}

export default function DelegateSetButton({ ...rest }: Props) {
    // TODO combine into one hook?
    const { setDelegate, ...setDelegateQuery } = useDelegateSet();
    const { refetch } = useDelegation();
    const { showToast } = useToast();

    useEffect(() => {
        if (setDelegateQuery.submitError) {
            showToast({
                id: 'setDelegate-error',
                auto: true,
                type: ToastType.Error,
                content: (
                    <HStack>
                        <Text>{setDelegateQuery.submitError.message}</Text>
                    </HStack>
                ),
            });
        }
    }, [setDelegateQuery.submitError]);

    return (
        <BeetsSubmitTransactionButton
            inline
            submittingText="Confirm..."
            pendingText="Waiting..."
            onClick={() => setDelegate()}
            onConfirmed={() => refetch()}
            {...setDelegateQuery}
            {...rest}
        >
            Delegate to vote optimizer
        </BeetsSubmitTransactionButton>
    );
}
