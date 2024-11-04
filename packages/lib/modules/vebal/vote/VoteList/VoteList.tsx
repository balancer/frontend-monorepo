import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { VoteListLayout } from './VoteListLayout'
import { VoteListProvider } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'

export async function VoteList() {
  return (
    <VoteListProvider>
      {/* fix: remove PoolListProvider when voteFilters implemented */}
      <PoolListProvider>
        <VoteListLayout />
      </PoolListProvider>
    </VoteListProvider>
  )
}
