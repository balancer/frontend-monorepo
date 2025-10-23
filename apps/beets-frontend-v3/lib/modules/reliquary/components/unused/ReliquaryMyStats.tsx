import { Grid, GridItem } from '@chakra-ui/react';
import React from 'react';
import RelicMaturity from '../charts/RelicMaturity';
import RelicApr from './RelicApr';
import RelicLiquidity from './RelicLiquidity';
import RelicRewards from './RelicRewards';

export default function ReliquaryMyStats() {
    return (
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(4, 1fr)' }} gap="6">
            <GridItem w="full">
                <RelicApr />
            </GridItem>
            <GridItem w="full">
                <RelicLiquidity />
            </GridItem>
            <GridItem w="full">
                <RelicRewards />
            </GridItem>
            <GridItem w="full">
                <RelicMaturity />
            </GridItem>
        </Grid>
    );
}
