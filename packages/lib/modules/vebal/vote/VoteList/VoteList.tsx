import { VoteListLayout } from './VoteListLayout'
import { VoteListProvider } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'

export async function VoteList() {
  return (
    <VoteListProvider>
      <VoteListLayout />
    </VoteListProvider>
  )
}
