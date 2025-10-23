import { Flex, Grid, GridItem } from '@chakra-ui/react';
import React from 'react';
import { ReliquaryCurveChart } from '../charts/ReliquaryCurveChart';
import { ReliquaryDetailsCharts } from '../charts/ReliquaryDetailsCharts';
import ReliquaryOverallStats from './ReliquaryOverallStats';

export default function ReliquaryGlobalStats() {
    return (
        <Grid
            templateColumns={{ base: '1fr', lg: '400px 1fr 1fr' }}
            templateRows={{ base: '1fr repeat(2, 400px)', lg: 'repeat(2, 400px)' }}
            templateAreas={{
                base: `"stats"
                       "details-charts"
                       "beetronix"
                       `,
                lg: `"stats details-charts details-charts"
                     "stats beetronix beetronix"`,
            }}
            gap="6"
            h="full"
            w="full"
        >
            <GridItem area="stats" w="full">
                <ReliquaryOverallStats />
            </GridItem>
            <GridItem area="details-charts" w="full">
                <ReliquaryDetailsCharts />
            </GridItem>
            <GridItem area="beetronix" w="full">
                <ReliquaryCurveChart />
            </GridItem>
        </Grid>
    );
}
