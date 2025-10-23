import { useSubmitTransaction } from '~/lib/util/useSubmitTransaction';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import ReliquaryAbi from '~/lib/abi/Reliquary.json';
import { useUserAccount } from '~/lib/user/useUserAccount';
import useReliquary from '~/modules/reliquary/lib/useReliquary';

export function useRelicHarvestRewards() {
    const networkConfig = useNetworkConfig();
    const { userAddress } = useUserAccount();
    const { selectedRelicId } = useReliquary();
    const { submit, submitAsync, ...rest } = useSubmitTransaction({
        config: {
            addressOrName: networkConfig.reliquary.address,
            contractInterface: ReliquaryAbi,
            functionName: 'harvest',
        },
        transactionType: 'HARVEST',
    });

    function harvest() {
        submit({
            args: [selectedRelicId, userAddress],
            toastText: `Harvesting rewards for relic #${selectedRelicId}`,
            walletText: `Harvest rewards for relic #${selectedRelicId}`,
        });
    }

    return {
        harvest,
        ...rest,
    };
}
