import { Center, CenterProps, HStack, Text } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { SignIcon } from '../../icons/SignIcon'
import { GasIcon } from '../../icons/GasIcon'

type Props = {
  icon: 'sign' | 'gas' | 'external-link'
}

const iconContainerStyles: CenterProps = {
  bg: 'whiteAlpha.500',
  h: '26px',
  opacity: '1',
  rounded: 'sm',
  shadow: '0',
  w: '26px',
  _groupHover: { bg: 'whiteAlpha.700' },
  transition: 'background 0.2s var(--ease-out-cubic)',
}

export function LabelWithIcon({ children, icon }: PropsWithChildren<Props>) {
  return (
    <HStack data-group spacing="sm" width="100%">
      <HStack justifyContent="center" spacing="sm" width="100%">
        <Text color="font.primaryGradient" fontWeight="bold">
          {children}
        </Text>
      </HStack>
      {icon === 'sign' && (
        <Center {...iconContainerStyles}>
          <SignIcon size={18} />
        </Center>
      )}
      {icon === 'gas' && (
        <Center {...iconContainerStyles}>
          <GasIcon size={18} />
        </Center>
      )}
    </HStack>
  )
}
