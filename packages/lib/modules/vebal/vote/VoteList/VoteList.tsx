import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { VoteListLayout } from './VoteListLayout'
import { VoteListProvider } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'
import { getHiddenHandVotingIncentivesEither } from '@repo/lib/shared/services/hidden-hand/getHiddenHandVotingIncentives'
import { GetVeBalVotingListDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { mins } from '@repo/lib/shared/utils/time'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { parseError } from '@repo/lib/shared/utils/errors'
import { PoolListDisplayType } from '@repo/lib/modules/pool/pool.types'

export async function VoteList() {
  const client = getApolloServerClient()

  function getVebalVotingList() {
    return client.query({
      query: GetVeBalVotingListDocument,
      context: {
        fetchOptions: {
          next: { revalidate: mins(1).toSecs() },
        },
      },
    })
  }

  const [{ data: voteListQueryData }, [votingIncentives, votingIncentivesError]] =
    await Promise.all([getVebalVotingList(), getHiddenHandVotingIncentivesEither()])

  return (
    <VoteListProvider
      data={voteListQueryData}
      votingIncentives={votingIncentives}
      votingIncentivesErrorMessage={parseError(votingIncentivesError)}
      votingIncentivesLoading={false} /* RSC (SSR) mode, no loading needed */
    >
      {/* fix: remove PoolListProvider when voteFilters implemented */}
      <PoolListProvider
        displayType={PoolListDisplayType.TokenPills}
        hidePoolTags={[]}
        hidePoolTypes={[]}
        hideProtocolVersion={[]}
      >
        <VoteListLayout />
      </PoolListProvider>
    </VoteListProvider>
  )
}
