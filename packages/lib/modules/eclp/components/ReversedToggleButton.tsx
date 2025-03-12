import { Button } from '@chakra-ui/react'
import { useEclpChart } from '../hooks/useEclpChart'
import { Icon } from '@chakra-ui/react'
import { Repeat } from 'react-feather'

export function ReversedToggleButton() {
  const { toggleIsReversed } = useEclpChart()
  return (
    <Button
      bottom={0}
      fontSize="xs"
      fontWeight="medium"
      onClick={toggleIsReversed}
      position="absolute"
      px={2}
      py={1}
      right={2}
      size="xs"
      variant="primary"
      zIndex={1}
    >
      <Icon as={Repeat} />
    </Button>
  )
}
