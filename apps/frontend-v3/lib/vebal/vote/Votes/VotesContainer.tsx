import { GetVeBalVotingListDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { VotesProvider } from '@bal/lib/vebal/vote/Votes/VotesProvider'
import { VoteListLayout } from '@bal/lib/vebal/vote/VoteList/VoteListLayout'
import { MyVotesLayout } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesLayout'
import { VoteListProvider } from '@bal/lib/vebal/vote/VoteList/VoteListProvider'
import { MyVotesProvider } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VotesIntroductionLayout } from '@bal/lib/vebal/vote/Votes/VotesIntroduction/VotesIntroductionLayout'
import { Box, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

export async function VotesContainer() {
  const client = getApolloServerClient()

  function getVebalVotingList() {
    return client.query({
      query: GetVeBalVotingListDocument,
      variables: { includeKilled: true },
      context: {
        fetchOptions: {
          cache: 'no-store', // Disable Next.js cache for large responses (>2MB)
        },
      },
    })
  }

  const { data: voteListQueryData } = await getVebalVotingList()

  return (
    <Box>
      <VotesIntroductionLayout />
      <DefaultPageContainer pt="md !important">
        <VotesProvider data={voteListQueryData}>
          <VoteListProvider>
            <VStack spacing="3xl" w="full">
              <TransactionStateProvider>
                <MyVotesProvider>
                  <MyVotesLayout />
                </MyVotesProvider>
              </TransactionStateProvider>
              <VoteListLayout />
            </VStack>
          </VoteListProvider>
        </VotesProvider>
      </DefaultPageContainer>
    </Box>
  )
}
