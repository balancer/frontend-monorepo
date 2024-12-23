import { Box, VStack, BoxProps } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { GetStakedSonicDataQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { LstInfoStats } from './lstInfoStats'

const COMMON_NOISY_CARD_PROPS: { contentProps: BoxProps; cardProps: BoxProps } = {
  contentProps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 'none',
    borderTopLeftRadius: 'none',
    borderBottomRightRadius: 'none',
    rounded: 'lg',
    overflow: 'hidden',
  },
  cardProps: {
    position: 'relative',
    height: 'full',
    rounded: 'lg',
    overflow: 'hidden',
  },
}

export function LstInfo({
  stakedSonicData,
  isStakedSonicDataLoading,
}: {
  stakedSonicData?: GetStakedSonicDataQuery
  isStakedSonicDataLoading: boolean
}) {
  return (
    <NoisyCard
      cardProps={COMMON_NOISY_CARD_PROPS.cardProps}
      contentProps={COMMON_NOISY_CARD_PROPS.contentProps}
    >
      <Box bottom={0} left={0} overflow="hidden" position="absolute" right={0} top={0}>
        <ZenGarden sizePx="280px" subdued variant="circle" />
      </Box>
      <VStack
        align="flex-start"
        h="full"
        justify="flex-start"
        m="auto"
        p={{ base: 'md', md: 'lg' }}
        role="group"
        spacing="sm"
        w="full"
        zIndex={1}
      >
        <LstInfoStats
          isStakedSonicDataLoading={isStakedSonicDataLoading}
          stakedSonicData={stakedSonicData}
        />
      </VStack>
    </NoisyCard>
  )
}
