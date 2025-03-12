import { HStack, Text, Icon, Box } from '@chakra-ui/react'
import { CustomPopover } from '@repo/lib/shared/components/popover/CustomPopover'
import { Info, ThumbsDown, ThumbsUp } from 'react-feather'
import { useEclpChart } from '../hooks/useEclpChart'

const OUT_OF_RANGE_TEXT =
  'The current price is out of the set liquidity range for this Concentrated Liquidity Pool (CLP). When a CLP is not in range, liquidity is not routed through this pool and LPs do not earn swap fees.'
const IN_RANGE_TEXT =
  'The current price is between the liquidity upper and lower bounds for this Concentrated Liquidity Pool (CLP). In range pools earn high swap fees.'

export function ClpBadge() {
  const { poolIsInRange } = useEclpChart()

  return (
    <CustomPopover
      bodyText={poolIsInRange ? IN_RANGE_TEXT : OUT_OF_RANGE_TEXT}
      headerText={`CLP ${poolIsInRange ? 'in' : 'out of'} range`}
      trigger="hover"
    >
      <Box
        alignItems="center"
        as="span"
        bg={poolIsInRange ? 'green.400' : 'orange.300'}
        borderRadius="sm"
        color="black"
        cursor="pointer"
        p="2"
        zIndex="1"
      >
        <HStack>
          <Icon as={poolIsInRange ? ThumbsUp : ThumbsDown} />
          <Text color="black">{`CLP ${poolIsInRange ? 'in' : 'out of'} range`}</Text>
          <Icon as={Info} />
        </HStack>
      </Box>
    </CustomPopover>
  )
}
