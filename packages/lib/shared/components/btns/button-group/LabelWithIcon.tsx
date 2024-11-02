import { HStack, Text } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { SignIcon } from '../../icons/SignIcon'
import { GasIcon } from '../../icons/GasIcon'

type Props = {
  icon: 'sign' | 'gas'
}

export function LabelWithIcon({ children, icon }: PropsWithChildren<Props>) {
  return (
    <HStack spacing="sm" width="100%">
      <HStack justifyContent="center" spacing="sm" width="100%">
        <Text color="font.primaryGradient" fontWeight="bold">
          {children}
        </Text>
      </HStack>
      {icon === 'sign' ? <SignIcon size={16} /> : <GasIcon size={16} />}
    </HStack>
  )
}
