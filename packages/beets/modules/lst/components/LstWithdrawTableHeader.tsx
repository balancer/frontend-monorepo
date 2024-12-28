'use client'

import { Grid, GridItem, Text } from '@chakra-ui/react'

export function LstWithdrawTableHeader({ ...rest }) {
  return (
    <Grid {...rest} borderBottom="1px solid" borderColor="border.base" p={['sm', 'md']} w="full">
      <GridItem>
        <Text fontWeight="bold">Amount</Text>
      </GridItem>
      <GridItem justifySelf="start">
        <Text fontWeight="bold" textAlign="left">
          Withdrawable after
        </Text>
      </GridItem>
      <GridItem /> {/* intentionally empty */}
    </Grid>
  )
}
