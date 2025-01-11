import { getHiddenHandVotingIncentives } from '@repo/lib/modules/vebal/vote/hidden-hand/getHiddenHandVotingIncentives'
import { GetVeBalVotingListDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { mins } from '@repo/lib/shared/utils/time'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { errorToJson } from '@repo/lib/shared/utils/errors'
import { VotesProvider } from '@repo/lib/modules/vebal/vote/Votes/VotesProvider'
import React from 'react'
import { VoteListLayout } from '@repo/lib/modules/vebal/vote/VoteList/VoteListLayout'
import { MyVotesLayout } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesLayout'
import { VoteListProvider } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'
import { VStack } from '@chakra-ui/react'
import { MyVotesProvider } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'

export async function VotesContainer() {
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
    <VotesProvider
      data={voteListQueryData}
      // Only plain objects are allowed as props within RSC
      error={errorToJson(error)}
      votingIncentives={votingIncentives}
      votingIncentivesError={errorToJson(votingIncentivesError)}
    >
      <VStack spacing="3xl" w="full">
        <TransactionStateProvider>
          <MyVotesProvider>
            <MyVotesLayout />
          </MyVotesProvider>
        </TransactionStateProvider>
        <VoteListProvider>
          <VoteListLayout />
        </VoteListProvider>
      </VStack>
    </VotesProvider>
  )
}
