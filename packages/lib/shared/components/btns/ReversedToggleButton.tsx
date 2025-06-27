import { Button } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/react'
import { Repeat } from 'react-feather'

export function ReversedToggleButton({ toggleIsReversed }: { toggleIsReversed: () => void }) {
  return (
    <Button
      bottom={0}
      cursor="pointer"
      fontSize="xs"
      fontWeight="medium"
      height="20px !important"
      minWidth="20px !important"
      onClick={toggleIsReversed}
      p="0 !important"
      position="absolute"
      right={0}
      rounded="sm !important"
      shadow="md"
      size="xs"
      variant="primary"
      width="20px !important"
      zIndex={1}
    >
      <Icon as={Repeat} />
    </Button>
  )
}
