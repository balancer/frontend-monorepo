import { GetVeBalVotingListDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { mins } from '@repo/lib/shared/utils/time'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { VotesProvider } from '@bal/lib/vebal/vote/Votes/VotesProvider'
import { VoteListLayout } from '@bal/lib/vebal/vote/VoteList/VoteListLayout'
import { MyVotesLayout } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesLayout'
import { VoteListProvider } from '@bal/lib/vebal/vote/VoteList/VoteListProvider'
import { VStack } from '@chakra-ui/react'
import { MyVotesProvider } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VotesIntroductionLayout } from '@bal/lib/vebal/vote/Votes/VotesIntroduction/VotesIntroductionLayout'

export async function VotesContainer() {
  const client = getApolloServerClient()

  function getVebalVotingList() {
    return client.query({
      query: GetVeBalVotingListDocument,
      variables: { includeKilled: true },
      context: {
        fetchOptions: {
          next: { revalidate: mins(1).toSecs() },
        },
      },
    })
  }

  const { data: voteListQueryData } = await getVebalVotingList()

  return (
    <VotesProvider data={voteListQueryData}>
      <VoteListProvider>
        <VStack spacing="3xl" w="full">
          <VotesIntroductionLayout />

          <TransactionStateProvider>
            <MyVotesProvider>
              <MyVotesLayout />
            </MyVotesProvider>
          </TransactionStateProvider>

          <VoteListLayout />
        </VStack>
      </VoteListProvider>
    </VotesProvider>
  )
}
