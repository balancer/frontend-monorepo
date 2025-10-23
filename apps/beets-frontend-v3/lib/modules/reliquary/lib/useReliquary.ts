import { useQuery } from 'react-query';
import { useProvider } from 'wagmi';
import { ReliquaryFarmPosition, reliquaryService } from '~/lib/services/staking/reliquary.service';
import { useUserAccount } from '~/lib/user/useUserAccount';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';
import { makeVar, useReactiveVar } from '@apollo/client';
import { usePool } from '~/modules/pool/lib/usePool';
import { keyBy, sumBy } from 'lodash';
import { useRef } from 'react';
import { TokenBase } from '~/lib/services/token/token-types';
import { useUserBalances } from '~/lib/user/useUserBalances';
import { useLegacyFBeetsBalance } from './useLegacyFbeetsBalance';

const selectedRelicId = makeVar<string | undefined>(undefined);
const createRelic = makeVar<boolean>(false);

export default function useReliquary() {
    const { userAddress } = useUserAccount();
    const provider = useProvider();
    const networkConfig = useNetworkConfig();
    const legacyBpt = useRef<TokenBase>({
        address: networkConfig.fbeets.poolAddress,
        symbol: 'BPT',
        name: 'BPT',
        decimals: 18,
    });
    const { pool } = usePool();

    const { userBalances: legacyBalances = [], isLoading: isLoadingLegacyBalances } = useUserBalances(
        [networkConfig.fbeets.address, networkConfig.fbeets.poolAddress],
        [legacyBpt.current],
    );

    const userBalancesMap = keyBy(legacyBalances, 'address');
    const legacyBptBalance = userBalancesMap[legacyBpt.current.address]?.amount || '0';
    const { total: legacyFbeetsBalance } = useLegacyFBeetsBalance();

    const {
        data: relicPositionsUnsorted = [],
        isLoading: isLoadingRelicPositions,
        refetch: refetchRelicPositions,
    } = useQuery(
        ['reliquaryAllPositions', userAddress],
        async () => {
            const positions: ReliquaryFarmPosition[] = await reliquaryService.getAllPositions({
                userAddress: userAddress || '',
                provider,
            });

            if (positions.length > 0 && selectedRelicId() === undefined) {
                selectedRelicId(positions[0].relicId);
            }

            return positions;
        },
        {
            enabled: !!userAddress && !!networkConfig.fbeets.address,
        },
    );

    const relicPositions = relicPositionsUnsorted.sort((a, b) => parseInt(a.relicId) - parseInt(b.relicId));

    const {
        data: maturityThresholds = [],
        isLoading: isLoadingMaturityThresholds,
        refetch: refetchMaturityThresholds,
    } = useQuery<string[]>(
        ['maturityThresholds', networkConfig.reliquary.fbeets.farmId],
        async () => {
            return await reliquaryService.getMaturityThresholds({
                pid: networkConfig.reliquary.fbeets.farmId.toString(),
                provider,
            });
        },
        {
            refetchOnWindowFocus: false,
        },
    );

    const selectedRelic = (relicPositions || []).find((position) => position.relicId === selectedRelicId());
    const isLoading = isLoadingRelicPositions || isLoadingMaturityThresholds;
    const relicIds = relicPositions.map((relic) => parseInt(relic.relicId));

    const beetsPerSecond = pool.staking?.reliquary?.beetsPerSecond || '0';
    const reliquaryLevels = pool.staking?.reliquary?.levels || [];
    const selectedRelicLevel = reliquaryLevels.find((level) => level.level === selectedRelic?.level);
    const weightedTotalBalance = sumBy(reliquaryLevels, (level) => parseFloat(level.balance) * level.allocationPoints);

    const relicPositionsForFarmId = relicPositions.filter(
        (position) => position.farmId.toString() === networkConfig.reliquary.fbeets.farmId.toString(),
    );
    const totalMaBeetsVP = sumBy(relicPositionsForFarmId, (position) => {
        const numFBeets = parseFloat(position.amount);
        const boost = reliquaryLevels.find((level) => level.level === position.level);
        return ((boost?.allocationPoints || 0) / 100) * numFBeets;
    });

    function setCreateRelic(value: boolean) {
        createRelic(value);
    }

    function setSelectedRelicId(value: string) {
        selectedRelicId(value);
    }

    return {
        relicPositions,
        isLoadingRelicPositions,
        isLoading,
        reliquaryService,
        maturityThresholds,
        selectedRelicId: useReactiveVar(selectedRelicId),
        selectedRelic: selectedRelic || null,
        selectedRelicApr: selectedRelicLevel?.apr || '0',
        beetsPerSecond,
        beetsPerDay: parseFloat(beetsPerSecond) * 86400,
        selectedRelicLevel,
        weightedTotalBalance,
        createRelic: useReactiveVar(createRelic),
        relicIds,
        legacyBptBalance,
        legacyFbeetsBalance,
        relicPositionsForFarmId,
        totalMaBeetsVP,

        setCreateRelic,
        setSelectedRelicId,
        refetchRelicPositions,
        refetchMaturityThresholds,
    };
}
