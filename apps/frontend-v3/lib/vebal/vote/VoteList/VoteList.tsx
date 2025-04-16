import { VoteListLayout } from './VoteListLayout'
import { VoteListProvider } from '@/lib/vebal/vote/VoteList/VoteListProvider'

export async function VoteList() {
  return (
    <VoteListProvider>
      <VoteListLayout />
    </VoteListProvider>
  )
}
