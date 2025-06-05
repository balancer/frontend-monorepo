import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { VotesContainer } from '@bal/lib/vebal/vote/Votes/VotesContainer'

export default function VotePage() {
  return (
    <FadeInOnView animateOnce={false}>
      <VotesContainer />
    </FadeInOnView>
  )
}
