'use client'

import { Card, CardBody, CardFooter, CardHeader, Button, Tooltip, Box } from '@chakra-ui/react'
import { useStake } from './StakeProvider'
import { useRef } from 'react'
import { StakeModal } from './StakeModal'
import { StakePreview } from './StakePreview'
import { useModalWithPoolRedirect } from '../../useModalWithPoolRedirect'
import { SafeAppAlert } from '@/lib/shared/components/alerts/SafeAppAlert'

export function StakeForm() {
  const { isDisabled, disabledReason, isLoading, stakeTxHash, pool } = useStake()
  const nextBtn = useRef(null)
  const { onClose, onOpen, isOpen } = useModalWithPoolRedirect(pool, stakeTxHash)

  return (
    <Box h="full" w="full" maxW="lg" mx="auto">
      <Card>
        <CardHeader>Stake for rewards</CardHeader>
        <CardBody>
          <SafeAppAlert />
          <StakePreview />
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
      <StakeModal finalFocusRef={nextBtn} isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </Box>
  )
}
