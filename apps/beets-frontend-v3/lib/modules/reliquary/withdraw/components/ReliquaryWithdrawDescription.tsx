import { Highlight } from '@chakra-ui/react';

export function ReliquaryWithdrawDescription() {
    return (
        <>
            <Highlight
                query={['Withdrawing proportionally', 'not', 'price impact']}
                styles={{ fontWeight: 'bold', color: 'white' }}
            >
                Withdrawing proportionally from this relic ensures you will not be subject to the potential fees caused
                by price impact.
            </Highlight>
            <br />
            <br />
            <Highlight query={['single asset', 'not', 'later']} styles={{ fontWeight: 'bold', color: 'white' }}>
                For now withdrawing a single asset is not available. This will be implemented at a later date.
            </Highlight>
            <br />
            <br />
            When withdrawing from any relic, your fBEETS are exchanged for the underlying tokens.
        </>
    );
}
