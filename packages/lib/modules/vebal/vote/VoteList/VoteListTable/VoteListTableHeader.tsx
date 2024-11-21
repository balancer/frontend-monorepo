'use client'

import { Grid, GridItem, Icon, Text, VStack } from '@chakra-ui/react'
import { Globe } from 'react-feather'

export function VoteListTableHeader({ ...rest }) {
  return (
    <Grid {...rest} borderBottom="1px solid" borderColor="border.base" p={['sm', 'md']} w="full">
      <GridItem>
        <VStack align="start" w="full">
          <Icon as={Globe} boxSize="5" color="font.primary" />
        </VStack>
      </GridItem>
      <GridItem>
        <Text fontWeight="bold">Pool name</Text>
      </GridItem>
      <GridItem justifySelf="end" maxW="maxContent">
        <Text fontWeight="bold" textAlign="right">
          Type
        </Text>
      </GridItem>
      <GridItem justifySelf="end" maxW="maxContent">
        <Text fontWeight="bold" textAlign="right">
          Bribes
        </Text>
      </GridItem>
      <GridItem justifySelf="end" maxW="maxContent">
        <Text fontWeight="bold" textAlign="right">
          Bribes/veBAL
        </Text>
      </GridItem>
      <GridItem justifySelf="end" maxW="maxContent">
        <Text fontWeight="bold" textAlign="right">
          veBAL votes
        </Text>
      </GridItem>
      <GridItem justifySelf="end" maxW="maxContent">
        <Text fontWeight="bold" textAlign="right">
          Action
        </Text>
      </GridItem>
    </Grid>
  )
}
