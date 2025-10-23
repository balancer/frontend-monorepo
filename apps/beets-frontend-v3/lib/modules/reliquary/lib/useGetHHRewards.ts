import { useQuery } from '@tanstack/react-query';
import { useUserAccount } from '~/lib/user/useUserAccount';

interface HHReward {
    symbol: string;
    name: string;
    token: string;
    decimals: number;
    chainId: number;
    protocol: string;
    claimable: string;
    cumulativeAmount: string;
    value: number;
    activeTimer: number;
    pausedTimer: number;
    claimMetadata: {
        identifier: string;
        account: string;
        amount: string;
        merkleProof: string[];
    };
}

interface HHRewardsResponse {
    error: boolean;
    data: HHReward[];
}

interface HHRewardsResult {
    rewards: HHReward[];
    totalValue: number;
}

export function useGetHHRewards() {
    const { userAddress } = useUserAccount();

    return useQuery({
        queryKey: ['hhRewards', userAddress],
        queryFn: async (): Promise<HHRewardsResult> => {
            if (!userAddress) {
                return { rewards: [], totalValue: 0 };
            }

            const response = await fetch(`https://api.hiddenhand.finance/reward/0/${userAddress}`);

            if (!response.ok) {
                throw new Error('Failed to fetch HiddenHand rewards');
            }

            const result: HHRewardsResponse = await response.json();

            if (result.error) {
                throw new Error('API returned error');
            }

            // Filter rewards to only include chainId 146
            const filteredRewards = result.data.filter((reward) => reward.chainId === 146);
            
            // Calculate total value
            const totalValue = filteredRewards.reduce((sum, reward) => sum + reward.value, 0);

            return {
                rewards: filteredRewards,
                totalValue,
            };
        },
        enabled: !!userAddress,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 15000, // Consider data stale after 15 seconds
    });
}
