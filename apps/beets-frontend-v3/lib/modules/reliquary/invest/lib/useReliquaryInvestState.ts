import { makeVar, useReactiveVar } from '@apollo/client';
import { AmountHumanReadable, AmountHumanReadableMap } from '~/lib/services/token/token-types';
import { keyBy, mapValues } from 'lodash';

interface InvestState {
    inputAmounts: AmountHumanReadableMap;
    selectedOptions: { [poolTokenIndex: string]: string };
}

export const investStateVar = makeVar<InvestState>({
    inputAmounts: {},
    selectedOptions: {},
});

export function useReliquaryInvestState() {
    function setInputAmounts(inputAmounts: AmountHumanReadableMap) {
        const state = investStateVar();

        investStateVar({
            ...state,
            inputAmounts,
        });
    }

    function setInputAmount(tokenAddress: string, amount: AmountHumanReadable) {
        const state = investStateVar();

        investStateVar({
            ...state,
            inputAmounts: {
                ...state.inputAmounts,
                [tokenAddress]: amount,
            },
        });
    }

    function setSelectedOption(poolTokenIndex: number, tokenAddress: string) {
        const state = investStateVar();

        investStateVar({
            ...state,
            selectedOptions: {
                ...state.selectedOptions,
                [`${poolTokenIndex}`]: tokenAddress,
            },
        });
    }

    function setSelectedOptions(options: { poolTokenIndex: number; tokenAddress: string }[]) {
        const state = investStateVar();

        investStateVar({
            ...state,
            selectedOptions: mapValues(
                keyBy(options, ({ poolTokenIndex }) => `${poolTokenIndex}`),
                'tokenAddress',
            ),
        });
    }

    function clearInvestState() {
        investStateVar({
            inputAmounts: {},
            selectedOptions: {},
        });
    }

    const state = useReactiveVar(investStateVar);

    return {
        setInputAmounts,
        setInputAmount,
        setSelectedOption,
        setSelectedOptions,
        clearInvestState,
        ...state,
        hasSelectedOptions: Object.keys(state.selectedOptions).length > 0,
    };
}
