'use client'

import { Box, Button, Card, CardBody, CardFooter, CardHeader, Tooltip } from '@chakra-ui/react'
import { useRef } from 'react'
import { useUnstake } from './UnstakeProvider'
import { UnstakePreview } from './UnstakePreview'
import { UnstakeModal } from './UnstakeModal'
import { useModalWithPoolRedirect } from '../../useModalWithPoolRedirect'
import { SafeAppAlert } from '@/lib/shared/components/alerts/SafeAppAlert'

export function UnstakeForm() {
  const nextBtn = useRef(null)

  const { isDisabled, disabledReason, isLoading, unstakeTxHash, pool } = useUnstake()

  const { onClose, onOpen, isOpen } = useModalWithPoolRedirect(pool, unstakeTxHash)

  return (
    <Box h="full" w="full" maxW="lg" mx="auto">
      <Card>
        <CardHeader>Claim & Unstake</CardHeader>
        <CardBody>
          <SafeAppAlert />
          <UnstakePreview />
        </CardBody>
        <CardFooter>
          <Tooltip label={isDisabled ? disabledReason : ''}>
            <Button
              ref={nextBtn}
              variant="secondary"
              w="full"
              size="lg"
              isDisabled={isDisabled}
              isLoading={isLoading}
              onClick={() => !isDisabled && onOpen()}
            >
              Next
            </Button>
          </Tooltip>
        </CardFooter>
      </Card>
      <UnstakeModal finalFocusRef={nextBtn} isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </Box>
  )
}
