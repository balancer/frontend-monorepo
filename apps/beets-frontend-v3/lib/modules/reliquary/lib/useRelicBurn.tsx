import { useSubmitTransaction } from '~/lib/util/useSubmitTransaction';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import ReliquaryAbi from '~/lib/abi/Reliquary.json';

export function useRelicBurn() {
    const networkConfig = useNetworkConfig();
    const { submit, submitAsync, ...rest } = useSubmitTransaction({
        config: {
            addressOrName: networkConfig.reliquary.address,
            contractInterface: ReliquaryAbi,
            functionName: 'burn',
        },
        transactionType: 'BURN',
    });

    function burn(relicId: string) {
        submit({
            args: [parseInt(relicId, 10)],
            toastText: `Burn relic #${relicId}`,
        });
    }

    return {
        burn,
        ...rest,
    };
}
