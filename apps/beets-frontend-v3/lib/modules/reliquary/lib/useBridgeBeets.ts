import { useSubmitTransaction } from '~/lib/util/useSubmitTransaction';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import BeetsOftProxyV2Abi from '~/lib/abi/BeetsOftProxyV2.json';
import { AmountHumanReadable } from '~/lib/services/token/token-types';
import { useUserAccount } from '~/lib/user/useUserAccount';
import { tokenFormatAmount } from '~/lib/services/token/token-util';
import { parseUnits } from 'ethers/lib/utils.js';

export const beetsOftProxy = '0x8d038dA833b154EBcFB7965a9eE7C4Ad72671b21';
const destinationChainId = 332;

export function useBridgeBeets() {
    const { submit, submitAsync, ...rest } = useSubmitTransaction({
        config: {
            addressOrName: beetsOftProxy,
            contractInterface: BeetsOftProxyV2Abi,
            functionName: 'sendFrom',
        },
        transactionType: 'BRIDGE',
    });
    const { userAddress } = useUserAccount();

    function bridge(amount: AmountHumanReadable) {
        submit({
            args: [
                userAddress, // _from
                destinationChainId, // _dstChainId
                `0x000000000000000000000000${userAddress?.substring(2)}`, // _toAddress
                parseUnits(amount, 18).toString(), // _amount
                {
                    // _callParams
                    refundAddress: `${userAddress}`, // _refund
                    zroPaymentAddress: '0x0000000000000000000000000000000000000000', // _zroPayment
                    adapterParams: '0x0001000000000000000000000000000000000000000000000000000000000001adb0', // _adapterParams
                },
            ],
            toastText: `Bridge ${tokenFormatAmount(amount)} BEETS`,
            overrides: {
                value: parseUnits('0.1', 18).toString(),
            },
        });
    }

    return {
        bridge,
        ...rest,
    };
}
