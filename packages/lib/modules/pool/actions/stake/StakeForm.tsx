'use client';
import { Card, Button, Box } from '@chakra-ui/react';
import { Tooltip } from '../../../../shared/components/tooltips/Tooltip'
import { useStake } from './StakeProvider'
import { useRef } from 'react'
import { StakeModal } from './StakeModal'
import { StakePreview } from './StakePreview'
import { useModalWithPoolRedirect } from '../../useModalWithPoolRedirect'
import { SafeAppAlert } from '@repo/lib/shared/components/alerts/SafeAppAlert'

export function StakeForm() {
  const { isDisabled, disabledReason, isLoading, stakeTxHash, pool } = useStake()
  const nextBtn = useRef(null)
  const { onClose, onOpen, isOpen } = useModalWithPoolRedirect(pool, stakeTxHash)

  return (
    <Box h="full" maxW="lg" mx="auto" w="full">
      <Card.Root>
        <Card.Header>Stake for rewards</Card.Header>
        <Card.Body>
          <SafeAppAlert />
          <StakePreview />
        </Card.Body>
        <Card.Footer>
          <Tooltip content={isDisabled ? disabledReason : ''}>
            <Button
              disabled={isDisabled}
              loading={isLoading}
              onClick={() => !isDisabled && onOpen()}
              ref={nextBtn}
              size="lg"
              variant="secondary"
              w="full"
            >
              Next
            </Button>
          </Tooltip>
        </Card.Footer>
      </Card.Root>
      <StakeModal finalFocusRef={nextBtn} isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
    </Box>
  );
}
