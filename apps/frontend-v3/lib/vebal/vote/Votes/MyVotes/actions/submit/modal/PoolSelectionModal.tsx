import {
  Button,
  Checkbox,
  CheckboxGroup,
  HStack,
  Text,
  VStack,
  Dialog,
  Portal,
} from '@chakra-ui/react'
import { SubmittingVote, useMyVotes } from '../../../MyVotesProvider'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { Address } from 'viem'

type Props = {
  open: boolean
  onClose(): void
  onContinue(): void
}

export function PoolSelectionModal({ open, onClose, onContinue }: Props) {
  const { selectableVotes, setSelectedVotes, changedVotes, submittableVotes } = useMyVotes()
  const selectableVotesIds = selectableVotes.map(vote => vote.vote.id)
  const updatedWeightVotes = changedVotes.filter(vote => !selectableVotesIds.includes(vote.vote.id))

  const continueOrClose = () => {
    if (submittableVotes.length > 0) return onContinue()
    onClose()
  }

  return (
    <Dialog.Root
      onOpenChange={(e: any) => {
        if (!e.open) {
          onClose()
        }
      }}
      open={open}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>Confirm vote resubmission</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <VStack>
                <Text color="font.secondary">
                  Since you are not utilizing your full voting power on the pools listed below, it
                  is assumed you will want to re-submit your vote now. However, there are some cases
                  where you may not want to re-submit (e.g. to avoid the 10-day time lock), so
                  please confirm.
                </Text>

                <Text fontWeight="bold" mt="4" w="full">
                  Select pools to resubmit:
                </Text>

                <CheckboxGroup
                  defaultValue={selectableVotes.map(vote => String(vote.vote.id))}
                  onValueChange={(votes: string[]) => setSelectedVotes(votes as Address[])}
                >
                  {selectableVotes.map(vote => (
                    <Checkbox.Root key={vote.vote.id} value={String(vote.vote.id)} w="full">
                      <Checkbox.HiddenInput />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Label>
                        <Checkbox.Root>
                          <Checkbox.HiddenInput />
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox.Root>
                        <Checkbox.Root>
                          <Checkbox.HiddenInput />
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Checkbox.Label>
                            <Checkbox.Root>
                              <Checkbox.HiddenInput />
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                            </Checkbox.Root>
                          </Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root>
                          <Checkbox.HiddenInput />
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Checkbox.Label>
                            <VoteDescription vote={vote} />
                          </Checkbox.Label>
                        </Checkbox.Root>
                      </Checkbox.Label>
                    </Checkbox.Root>
                  ))}
                </CheckboxGroup>

                {updatedWeightVotes.map(vote => (
                  <Checkbox.Root
                    defaultChecked
                    disabled
                    key={vote.vote.id}
                    value={String(vote.vote.id)}
                    w="full"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label>
                      <Checkbox.Root>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox.Root>
                      <Checkbox.Root>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Label>
                          <Checkbox.Root>
                            <Checkbox.HiddenInput />
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                          </Checkbox.Root>
                        </Checkbox.Label>
                      </Checkbox.Root>
                      <Checkbox.Root>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Label>
                          <VoteDescription vote={vote} />
                        </Checkbox.Label>
                      </Checkbox.Root>
                    </Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={continueOrClose} variant="primary" w="full">
                {submittableVotes.length > 0 ? 'Continue' : 'Return to vote page'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
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
