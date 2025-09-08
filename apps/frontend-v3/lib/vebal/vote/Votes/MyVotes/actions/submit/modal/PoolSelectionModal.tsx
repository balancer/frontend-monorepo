import {
  Button,
  Checkbox,
  CheckboxGroup,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react'
import { SubmittingVote, useMyVotes } from '../../../MyVotesProvider'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { Address } from 'viem'

type Props = {
  isOpen: boolean
  onClose(): void
  onContinue(): void
}

export function PoolSelectionModal({ isOpen, onClose, onContinue }: Props) {
  const { selectableVotes, setSelectedVotes, changedVotes, submittableVotes } = useMyVotes()
  const selectableVotesIds = selectableVotes.map(vote => vote.vote.id)
  const updatedWeightVotes = changedVotes.filter(vote => !selectableVotesIds.includes(vote.vote.id))

  const continueOrClose = () => {
    if (submittableVotes.length > 0) return onContinue()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm vote resubmission</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack>
            <Text color="font.secondary">
              Since you are not utilizing your full voting power on the pools listed below, it is
              assumed you will want to re-submit your vote now. However, there are some cases where
              you may not want to re-submit (e.g. to avoid the 10-day time lock), so please confirm.
            </Text>

            <Text fontWeight="bold" mt="4" w="full">
              Select pools to resubmit:
            </Text>

            <CheckboxGroup
              defaultValue={selectableVotes.map(vote => vote.vote.id)}
              onChange={(votes: string[]) => setSelectedVotes(votes as Address[])}
            >
              {selectableVotes.map(vote => (
                <Checkbox key={vote.vote.id} value={vote.vote.id} w="full">
                  <VoteDescription vote={vote} />
                </Checkbox>
              ))}
            </CheckboxGroup>

            {updatedWeightVotes.map(vote => (
              <Checkbox defaultChecked isDisabled key={vote.vote.id} value={vote.vote.id} w="full">
                <VoteDescription vote={vote} />
              </Checkbox>
            ))}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={continueOrClose} variant="primary" w="full">
            {submittableVotes.length > 0 ? 'Continue' : 'Return to vote page'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function poolName(vote: VotingPoolWithData) {
  return vote.poolTokens.map(token => token.underlyingToken?.symbol || token.symbol).join(' / ')
}

function VoteDescription({ vote }: { vote: SubmittingVote }) {
  return (
    <HStack w="full">
      <NetworkIcon chain={vote.vote.chain} size={6} />
      <Text>{poolName(vote.vote)}</Text>
    </HStack>
  )
}
