import { Skeleton, VStack } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Suspense } from 'react'
import { VotesContainer } from '@repo/lib/modules/vebal/vote/Votes/VotesContainer'

export default function VotePage() {
  return (
    <FadeInOnView animateOnce={false}>
      <Suspense
        fallback={
          <VStack spacing="md" w="full">
            <Skeleton h="500px" w="full" />
            <Skeleton h="500px" w="full" />
          </VStack>
        }
      >
        <VotesContainer />
      </Suspense>
    </FadeInOnView>
  )
}
