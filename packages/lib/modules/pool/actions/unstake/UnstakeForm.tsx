'use client'

import { Box, Button, Card, CardBody, CardFooter, CardHeader, Tooltip } from '@chakra-ui/react'
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
      <Card>
        <CardHeader>Claim & Unstake</CardHeader>
        <CardBody>
          <SafeAppAlert />
          <UnstakePreview />
        </CardBody>
        <CardFooter>
          <Tooltip label={isDisabled ? disabledReason : ''}>
            <Button
              isDisabled={isDisabled}
              isLoading={isLoading}
              onClick={() => !isDisabled && onOpen()}
              ref={nextBtn}
              size="lg"
              variant="secondary"
              w="full"
            >
              Next
            </Button>
          </Tooltip>
        </CardFooter>
      </Card>
      <UnstakeModal finalFocusRef={nextBtn} isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
    </Box>
  )
}
