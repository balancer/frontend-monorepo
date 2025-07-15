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
        h="32px"
        mb={['6px', '4px', '0px']} // to prevent jittering on mobile
        px="2"
        shadow="md"
        w="max-content"
        zIndex="1"
      >
        <HStack h="full" justifyContent="center">
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
