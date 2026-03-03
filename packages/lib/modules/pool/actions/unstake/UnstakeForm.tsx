'use client';
import { Box, Button, Card } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { useRef } from 'react'
import { useUnstake } from './UnstakeProvider'
import { UnstakePreview } from './UnstakePreview'
import { UnstakeModal } from './UnstakeModal'
import { useModalWithPoolRedirect } from '../../useModalWithPoolRedirect'
import { SafeAppAlert } from '@repo/lib/shared/components/alerts/SafeAppAlert'

export function UnstakeForm() {
  const nextBtn = useRef(null)

  const { isDisabled, disabledReason, isLoading, unstakeTxHash, pool } = useUnstake()

  const { onClose, onOpen, isOpen } = useModalWithPoolRedirect(pool, unstakeTxHash)

  return (
    <Box h="full" maxW="lg" mx="auto" w="full">
      <Card.Root>
        <Card.Header>Claim & Unstake</Card.Header>
        <Card.Body>
          <SafeAppAlert />
          <UnstakePreview />
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
      <UnstakeModal finalFocusRef={nextBtn} isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
    </Box>
  );
}
