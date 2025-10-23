import { useGetReliquaryFarmSnapshotsQuery } from '~/apollo/generated/graphql-codegen-generated';
import { useNetworkConfig } from '~/lib/global/useNetworkConfig';

export function useReliquaryGlobalStats() {
    const config = useNetworkConfig();
    const { data, ...rest } = useGetReliquaryFarmSnapshotsQuery({
        variables: { id: `${config.reliquary.fbeets.farmId}`, range: 'THIRTY_DAYS' },
    });

    const latest = data && data.snapshots.length > 0 ? data.snapshots[data.snapshots.length - 1] : null;

    return {
        ...rest,
        data: latest,
    };
}
