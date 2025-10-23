import { useSubmitTransaction } from '~/lib/util/useSubmitTransaction';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import DelegateRegistryAbi from '~/lib/abi/DelegateRegistry.json';

export function useDelegateClear() {
    const networkConfig = useNetworkConfig();
    const { submit, submitAsync, ...rest } = useSubmitTransaction({
        config: {
            addressOrName: networkConfig.snapshot.contractAddress,
            contractInterface: DelegateRegistryAbi,
            functionName: 'clearDelegate',
        },
        transactionType: 'UNDELEGATE',
    });

    function clearDelegate() {
        submit({
            args: [networkConfig.snapshot.id],
            toastText: 'Undelegate from vote optimizer',
        });
    }

    return {
        clearDelegate,
        ...rest,
    };
}
