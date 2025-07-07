import { HStack, Text, Icon, Box } from '@chakra-ui/react'
import { CustomPopover } from '@repo/lib/shared/components/popover/CustomPopover'
import { ElementType } from 'react'
import { Info } from 'react-feather'

type ClpBadgeProps = {
  bodyText: string
  headerText: string
  bgColor: string
  icon: ElementType
}

export function ClpBadge({ icon, bodyText, headerText, bgColor }: ClpBadgeProps) {
  return (
    <CustomPopover bodyText={bodyText} headerText={headerText} trigger="hover">
      <Box
        alignItems="center"
        as="span"
        bg={bgColor}
        borderRadius="sm"
        color="black"
        cursor="pointer"
        mb={['6px', '4px', '0px']} // to prevent jittering on mobile
        p="2"
        w="max-content"
        zIndex="1"
      >
        <HStack>
          {icon && <Icon as={icon} />}
          <Text color="black" fontSize="sm" fontWeight="bold">
            {headerText}
          </Text>
          <Icon as={Info} />
        </HStack>
      </Box>
    </CustomPopover>
  )
}
