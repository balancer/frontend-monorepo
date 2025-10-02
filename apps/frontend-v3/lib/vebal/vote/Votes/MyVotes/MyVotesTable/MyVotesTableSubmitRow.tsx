import {
  Box,
  Button,
  Grid,
  GridItem,
  GridItemProps,
  GridProps,
  useDisclosure,
} from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useRef } from 'react'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { SubmitVotesModal } from '@bal/lib/vebal/vote/Votes/MyVotes/actions/submit/modal/SubmitVotesModal'
import { useVotes } from '@bal/lib/vebal/vote/Votes/VotesProvider'
import { PoolSelectionModal } from '../actions/submit/modal/PoolSelectionModal'
import { Address } from 'viem'

interface Props extends GridProps {
  keyValue: string | number
  cellProps: GridItemProps
}

export function MyVotesSubmitRow({ keyValue, cellProps, ...rest }: Props) {
  const {
    hasChanges,
    hasExceededWeight,
    refetchAll,
    transactionSteps,
    hasExpiredGauges,
    hasNewVotes,
    selectableVotes,
    setSelectedVotes,
  } = useMyVotes()
  const { allowChangeVotes } = useVotes()
  const { changedVotes } = useMyVotes()
  const numberOfSelectableVotes = changedVotes.filter(vote => {
    const previousWeight = vote.vote.gaugeVotes?.userVotes || '0'
    return previousWeight === vote.weight
  }).length

  const submitBtn = useRef(null)

  const {
    isOpen: submitModalIsOpen,
    onOpen: submitModalOnOpen,
    onClose: submitModalOnClose,
  } = useDisclosure()

  const {
    isOpen: poolSelectionIsOpen,
    onOpen: poolSelectionOnOpen,
    onClose: poolSelectionOnClose,
  } = useDisclosure()

  // hasExpiredGauges - allow to submit votes if there are expired pool gauges, so user could "remove" these pools
  const isDisabled =
    (!hasChanges && !hasExpiredGauges && !hasNewVotes) || hasExceededWeight || !allowChangeVotes

  const submitVotes = () => {
    if (numberOfSelectableVotes > 0) {
      setSelectedVotes(selectableVotes.map(vote => vote.vote.id) as Address[])
      return poolSelectionOnOpen()
    }
    submitModalOnOpen()
  }

  const continueAfterPoolSelection = () => {
    poolSelectionOnClose()
    submitModalOnOpen()
  }

  const handleClose = (anySuccess: boolean) => {
    if (anySuccess) {
      transactionSteps.resetTransactionSteps()
      refetchAll()
    }
    submitModalOnClose()
  }

  return (
    <>
      <FadeInOnView>
        <Box
          _hover={{
            bg: 'background.level0',
          }}
          key={keyValue}
          px={{ base: '0', sm: 'md' }}
          rounded="md"
          transition="all 0.2s ease-in-out"
          w="full"
        >
          <Grid {...rest} pr="4" py={{ base: 'ms', md: 'md' }}>
            <GridItem {...cellProps} />
            <GridItem {...cellProps} />
            <GridItem {...cellProps} />
            <GridItem {...cellProps} />
            <GridItem {...cellProps} />
            <GridItem justifySelf="end" textAlign="right" {...cellProps}>
              <Button
                isDisabled={isDisabled}
                onClick={submitVotes}
                ref={submitBtn}
                variant="primary"
              >
                Submit votes
              </Button>
            </GridItem>
            <GridItem {...cellProps} />
          </Grid>
        </Box>
      </FadeInOnView>

      <SubmitVotesModal
        finalFocusRef={submitBtn}
        isOpen={submitModalIsOpen}
        onClose={handleClose}
        onOpen={submitModalOnOpen}
      />

      <PoolSelectionModal
        isOpen={poolSelectionIsOpen}
        onClose={poolSelectionOnClose}
        onContinue={continueAfterPoolSelection}
      />
    </>
  )
}
