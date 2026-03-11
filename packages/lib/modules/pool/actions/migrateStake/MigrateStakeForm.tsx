'use client'
import { Box, Button, Card, useDisclosure, Icon } from '@chakra-ui/react'
import { Tooltip } from '../../../../shared/components/tooltips/Tooltip'
import { useRef } from 'react'
import { useMigrateStake } from './MigrateStakeProvider'
import { MigrateStakePreview } from './MigrateStakePreview'
import { MigrateStakeModal } from './MigrateStakeModal'
import { migrateStakeTooltipLabel } from '../stake.helpers'
import { LuInfo } from 'react-icons/lu'

export function MigrateStakeForm() {
  const nextBtn = useRef(null)
  const { onClose, onOpen, open } = useDisclosure()

  const { isDisabled, disabledReason, isLoading } = useMigrateStake()

  return (
    <Box h="full" maxW="lg" mx="auto" w="full">
      <Card.Root>
        <Card.Header truncate>
          Migrate to new staking gauge{' '}
          <Tooltip content={migrateStakeTooltipLabel}>
            <Icon asChild color="grayText" fontSize="sm">
              <LuInfo />
            </Icon>
          </Tooltip>
        </Card.Header>

        <Card.Body>
          <MigrateStakePreview />
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
      <MigrateStakeModal finalFocusRef={nextBtn} onClose={onClose} onOpen={onOpen} open={open} />
    </Box>
  )
}
