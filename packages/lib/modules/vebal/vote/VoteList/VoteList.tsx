import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { VoteListLayout } from './VoteListLayout'
import { VoteListProvider } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'
import { getHiddenHandVotingIncentives } from '@repo/lib/modules/vebal/vote/hidden-hand/getHiddenHandVotingIncentives'
import { GetVeBalVotingListDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { mins } from '@repo/lib/shared/utils/time'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { errorToJson } from '@repo/lib/shared/utils/errors'

export async function VoteList() {
  const client = getApolloServerClient()

  const [{ data: voteListQueryData, error }, [votingIncentives, votingIncentivesError]] =
    await Promise.all([
      client.query({
        query: GetVeBalVotingListDocument,
        context: {
          fetchOptions: {
            next: { revalidate: mins(1).toSecs() },
          },
        },
      }),
      getHiddenHandVotingIncentives()
        .then(value => [value, undefined] as const)
        .catch(err => [undefined, err] as const),
    ])

  return (
    <VoteListProvider
      data={voteListQueryData}
      // Only plain objects are allowed as props within RSC
      error={errorToJson(error)}
      votingIncentives={votingIncentives}
      votingIncentivesError={errorToJson(votingIncentivesError)}
    >
      {/* fix: remove PoolListProvider when voteFilters implemented */}
      <PoolListProvider>
        <VoteListLayout />
      </PoolListProvider>
    </VoteListProvider>
  )
}
