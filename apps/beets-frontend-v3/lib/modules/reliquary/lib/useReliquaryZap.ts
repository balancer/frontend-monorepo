import { batchRelayerContractConfig, useSubmitTransaction } from '~/lib/util/useSubmitTransaction';

export function useReliquaryZap(type: 'MIGRATE' | 'DEPOSIT' | 'WITHDRAW') {
    const { submit, submitAsync, ...rest } = useSubmitTransaction({
        config: batchRelayerContractConfig,
        transactionType: type === 'WITHDRAW' ? 'EXIT' : 'JOIN',
    });

    async function reliquaryZap(calls: string[]) {
        submit({
            args: [calls],
            toastText:
                type === 'WITHDRAW'
                    ? 'Withdrawing from maBEETS'
                    : type === 'MIGRATE'
                    ? 'Migrating into maBEETS'
                    : 'Depositing into maBEETS',
            walletText:
                type === 'WITHDRAW'
                    ? 'Withdraw from maBEETS'
                    : type === 'MIGRATE'
                    ? 'Migrate into maBEETS'
                    : 'Deposit into maBEETS',
        });
    }

    return {
        reliquaryZap,
        ...rest,
    };
}
