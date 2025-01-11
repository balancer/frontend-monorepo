import {
  Box,
  Button,
  Grid,
  GridItem,
  GridItemProps,
  GridProps,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import React from 'react'
import { useMyVotes } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { VoteWeight } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/VoteWeight'

interface Props extends GridProps {
  keyValue: string | number
  cellProps: GridItemProps
}

export function MyVotesTotalRow({ keyValue, cellProps, ...rest }: Props) {
  const { totalInfo, clearAll, hasChanges } = useMyVotes()
  const { toCurrency } = useCurrency()

  const votingIncentivesLoading = false
  const gaugeVotesIsLoading = false

  const editVotesStyles = {
    // fix: (votes) implement nested cell paddings for Edit votes column
    // bg: 'background.level1',
  }

  return (
    <FadeInOnView>
      <Box
        _hover={{
          bg: 'background.level0',
        }}
        key={keyValue}
        // fix: (votes) implement nested cell paddings for Edit votes column
        px={{ base: '0', sm: 'md' }}
        rounded="md"
        transition="all 0.2s ease-in-out"
        w="full"
      >
        <Grid {...rest} pr="4" py={{ base: 'ms', md: 'md' }}>
          <GridItem mr="-2" {...cellProps}>
            <Text color="font.maxContrast">Total</Text>
          </GridItem>
          <GridItem {...cellProps} />
          <GridItem justifySelf="end" textAlign="right" {...cellProps}>
            {votingIncentivesLoading ? (
              <Skeleton h="20px" w="60px" />
            ) : totalInfo.totalValue ? (
              <Text color="font.maxContrast">
                {toCurrency(totalInfo.totalValue, { abbreviated: false })}
              </Text>
            ) : (
              <Text color="red.400">&mdash;</Text>
            )}
          </GridItem>
          <GridItem justifySelf="end" textAlign="right" {...cellProps}>
            {votingIncentivesLoading ? (
              <Skeleton h="20px" w="60px" />
            ) : totalInfo.valuePerVote ? (
              <Text color="font.maxContrast">
                {toCurrency(totalInfo.valuePerVote, { abbreviated: false })}
              </Text>
            ) : (
              <Text color="red.400">&mdash;</Text>
            )}
          </GridItem>
          <GridItem justifySelf="end" textAlign="right" {...cellProps}>
            {gaugeVotesIsLoading ? (
              <Skeleton h="20px" w="60px" />
            ) : (
              <VoteWeight total variant="primary" weight={totalInfo.currentVotes ?? 0} />
            )}
          </GridItem>
          <GridItem
            justifySelf="end"
            pr="20px"
            textAlign="right"
            {...cellProps}
            {...editVotesStyles}
          >
            <VoteWeight
              skipTotalWarnings={!hasChanges}
              total
              variant="primary"
              weight={totalInfo.editVotes ?? 0}
            />
          </GridItem>
          <GridItem mx="-2" {...cellProps}>
            <VStack align="center" w="full">
              <Button
                color="font.secondary"
                fontSize="sm"
                isDisabled={!hasChanges}
                onClick={clearAll}
                size="sm"
                variant="ghost"
              >
                Clear all
              </Button>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </FadeInOnView>
  )
}
