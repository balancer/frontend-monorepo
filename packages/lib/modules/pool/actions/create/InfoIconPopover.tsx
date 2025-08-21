import { IconButton } from '@chakra-ui/react'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'

// TODO: ask pon about messages to display that are not shown in figma designs

export function InfoIconPopover() {
  return (
    <IconButton
      _hover={{
        opacity: '1',
      }}
      aria-label="Token info"
      color="grayText"
      h="24px"
      icon={<InfoIcon />}
      isRound
      opacity="0.5"
      size="xs"
      variant="link"
    />
  )
}
