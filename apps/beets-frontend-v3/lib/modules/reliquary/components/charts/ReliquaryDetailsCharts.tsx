import { Box, HStack, Select } from '@chakra-ui/react';
import Card from '~/components/card/Card';
import { useState } from 'react';
import {
    GqlPoolSnapshotDataRange,
    useGetReliquaryFarmSnapshotsQuery,
} from '~/apollo/generated/graphql-codegen-generated';
import { networkConfig } from '~/lib/config/network-config';
import { ReliquaryMaturityChart } from './ReliquaryMaturityChart';
import { ReliquaryLiquidityChart } from './ReliquaryLiquidityChart';
import { ReliquaryRelicsCountChart } from './ReliquaryRelicsCountChart';
import { ReliquaryMaBEETSLevelChart } from './ReliquaryMaBEETSLevelChart';

type ChartType = 'FB_LEV' | 'RELICS' | 'TVL' | 'MAB_LEV';

export function ReliquaryDetailsCharts() {
    const [chartType, setChartType] = useState<ChartType>('FB_LEV');
    const [range, setRange] = useState<GqlPoolSnapshotDataRange>('THIRTY_DAYS');
    const { data } = useGetReliquaryFarmSnapshotsQuery({
        variables: { id: networkConfig.reliquary.fbeets.farmId.toString(), range },
    });

    return (
        <Card height="full" p="4">
            <HStack
                spacing={{ base: '0', lg: '1' }}
                padding={{ base: '0', lg: '2' }}
                pb="0"
                justify={{ base: 'space-between', lg: 'flex-start' }}
            >
                <Select
                    value={chartType}
                    onChange={(e) => setChartType(e.currentTarget.value as ChartType)}
                    width={{ base: '165px', lg: '180px' }}
                    variant="filled"
                >
                    <option value="FB_LEV">fBEETS</option>
                    <option value="MAB_LEV">maBEETS</option>
                    <option value="RELICS">Relics</option>
                    <option value="TVL">TVL</option>
                </Select>
                {chartType !== 'FB_LEV' && chartType !== 'MAB_LEV' && (
                    <Select
                        pl={{ base: '1', lg: undefined }}
                        value={range}
                        onChange={(e) => setRange(e.currentTarget.value as GqlPoolSnapshotDataRange)}
                        width={{ base: '155px', lg: '160px' }}
                        variant="filled"
                    >
                        <option value="THIRTY_DAYS">last 30 days</option>
                        <option value="NINETY_DAYS">last 90 days</option>
                        <option value="ONE_HUNDRED_EIGHTY_DAYS">last 180 days</option>
                        <option value="ONE_YEAR">last 365 days</option>
                        <option value="ALL_TIME">All time</option>
                    </Select>
                )}
            </HStack>
            <Box height="full">
                {chartType === 'FB_LEV' && <ReliquaryMaturityChart />}
                {chartType === 'MAB_LEV' && <ReliquaryMaBEETSLevelChart />}
                {chartType === 'TVL' && <ReliquaryLiquidityChart data={data?.snapshots || []} />}
                {chartType === 'RELICS' && <ReliquaryRelicsCountChart data={data?.snapshots || []} />}
            </Box>
        </Card>
    );
}
