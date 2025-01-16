import { Skeleton } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Suspense } from 'react'
import { VoteList } from '@repo/lib/modules/vebal/vote/VoteList/VoteList'

export default function VotePage() {
  return (
    <FadeInOnView animateOnce={false}>
      <Suspense fallback={<Skeleton h="500px" w="full" />}>
        <VoteList />
      </Suspense>
    </FadeInOnView>
  )
}
