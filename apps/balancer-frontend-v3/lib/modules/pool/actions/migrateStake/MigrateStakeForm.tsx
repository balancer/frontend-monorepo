'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { useMigrateStake } from './MigrateStakeProvider'
import { MigrateStakePreview } from './MigrateStakePreview'
import { MigrateStakeModal } from './MigrateStakeModal'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { migrateStakeTooltipLabel } from '../stake.helpers'

export function MigrateStakeForm() {
  const nextBtn = useRef(null)
  const { onClose, onOpen, isOpen } = useDisclosure()

  const { isDisabled, disabledReason, isLoading } = useMigrateStake()

  return (
    <Box h="full" maxW="lg" mx="auto" w="full">
      <Card>
        <CardHeader isTruncated>
          Migrate to new staking gauge{' '}
          <Tooltip label={migrateStakeTooltipLabel}>
            <InfoOutlineIcon color="grayText" fontSize="sm" />
          </Tooltip>
        </CardHeader>

        <CardBody>
          <MigrateStakePreview />
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
      <MigrateStakeModal
        finalFocusRef={nextBtn}
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
      />
    </Box>
  )
}
