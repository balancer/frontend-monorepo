import {
  Box,
  Button,
  Grid,
  GridItem,
  GridItemProps,
  GridProps,
  Skeleton,
  Text,
  Divider,
  VStack,
} from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { VoteWeight } from '@bal/lib/vebal/vote/Votes/MyVotes/VoteWeight'
import { useVoteList } from '../../../VoteList/VoteListProvider'
import { bn } from '@repo/lib/shared/utils/numbers'

interface Props extends GridProps {
  keyValue: string | number
  cellProps: GridItemProps
}

export function MyVotesTotalRow({ keyValue, cellProps, ...rest }: Props) {
  const { totalInfo, clearAll, hasChanges, hasVotedBefore } = useMyVotes()
  const { toCurrency } = useCurrency()

  const { incentivesAreLoading, gaugeVotesIsLoading } = useVoteList()

  return (
    <FadeInOnView>
      <Divider />
      <Box
        _hover={{
          bg: 'background.level0',
        }}
        key={keyValue}
        px={{ base: '0', sm: 'md' }}
        transition="all 0.2s ease-in-out"
        w="full"
      >
        <Grid {...rest} pr="4" py={{ base: 'ms', md: 'md' }}>
          <GridItem mr="-2" {...cellProps}>
            <Text color="font.maxContrast">Total</Text>
          </GridItem>
          <GridItem {...cellProps} />
          <GridItem justifySelf="end" textAlign="right" {...cellProps}>
            {incentivesAreLoading ? (
              <Skeleton h="20px" w="60px" />
            ) : totalInfo.totalRewardValue ? (
              <Text color="font.maxContrast">
                {toCurrency(totalInfo.totalRewardValue, { abbreviated: false })}
              </Text>
            ) : (
              <Text color="red.400">&mdash;</Text>
            )}
          </GridItem>

          <GridItem justifySelf="end" textAlign="right" {...cellProps}>
            {incentivesAreLoading ? (
              <Skeleton h="20px" w="60px" />
            ) : totalInfo.averageRewardPerVote ? (
              <Text color="font.maxContrast">
                {toCurrency(totalInfo.averageRewardPerVote, {
                  abbreviated: false,
                  forceThreeDecimals: true,
                })}
              </Text>
            ) : (
              <Text color="red.400">&mdash;</Text>
            )}
          </GridItem>

          <GridItem justifySelf="end" mr="0" textAlign="right" {...cellProps}>
            {gaugeVotesIsLoading ? (
              <Skeleton h="20px" w="60px" />
            ) : (
              <VoteWeight
                skipTotalWarnings={!hasVotedBefore}
                total
                variant="primary"
                weight={totalInfo.currentVotes || bn(0)}
              />
            )}
          </GridItem>

          <GridItem justifySelf="end" mr="5px" textAlign="right" {...cellProps}>
            <VoteWeight
              skipTotalWarnings={!hasChanges}
              total
              variant="primary"
              weight={totalInfo.editVotes || bn(0)}
            />
          </GridItem>

          <GridItem mx="-2" {...cellProps}>
            <VStack align="center" w="full">
              <Button
                color="font.secondary"
                fontSize="xs"
                isDisabled={!hasChanges}
                onClick={clearAll}
                size="xs"
                variant="ghost"
              >
                Clear all
              </Button>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
      <Divider />
    </FadeInOnView>
  )
}
