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
import React, { useRef } from 'react'
import { useMyVotes } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { SubmitVotesModal } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/actions/submit/modal/SubmitVotesModal'
import { useVotes } from '@repo/lib/modules/vebal/vote/Votes/VotesProvider'

interface Props extends GridProps {
  keyValue: string | number
  cellProps: GridItemProps
}

export function MyVotesSubmitRow({ keyValue, cellProps, ...rest }: Props) {
  const { hasChanges, hasExceededWeight, refetchAll, transactionSteps, hasExpiredGauges } =
    useMyVotes()
  const { allowChangeVotes } = useVotes()

  const editVotesStyles = {
    // fix: (votes) implement nested cell paddings for Edit votes column
    // bg: 'background.level1',
  }

  const submitBtn = useRef(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

  // hasExpiredGauges - allow to submit votes if there are expired pool gauges, so user could "remove" these pools
  const isDisabled = (!hasChanges && !hasExpiredGauges) || hasExceededWeight || !allowChangeVotes

  const handleClose = (anySuccess: boolean) => {
    if (anySuccess) {
      transactionSteps.resetTransactionSteps()
      refetchAll()
    }
    onClose()
  }

  return (
    <FadeInOnView>
      <Box
        _hover={{
          bg: 'background.level0',
        }}
        key={keyValue}
        // fix: (votes) implement nested cell paddings for Edit votes column
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
          <GridItem justifySelf="end" textAlign="right" {...cellProps} {...editVotesStyles}>
            <Button isDisabled={isDisabled} onClick={onOpen} ref={submitBtn} variant="primary">
              Submit votes
            </Button>
          </GridItem>
          <SubmitVotesModal
            finalFocusRef={submitBtn}
            isOpen={isOpen}
            onClose={handleClose}
            onOpen={onOpen}
          />
          <GridItem {...cellProps} />
        </Grid>
      </Box>
    </FadeInOnView>
  )
}
