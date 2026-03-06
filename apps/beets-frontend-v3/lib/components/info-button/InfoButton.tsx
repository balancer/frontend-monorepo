import { InfoIconPopover } from '@repo/lib/modules/pool/actions/create/InfoIconPopover'
import { HStack, Text, TextProps } from '@chakra-ui/react'

interface InfoButtonProps {
  label: string
  infoText: string
  labelProps?: TextProps
}

export function InfoButton({ label, infoText, labelProps }: InfoButtonProps) {
  return (
    <HStack>
      <Text {...labelProps}>{label}</Text>
      <InfoIconPopover message={infoText} />
    </HStack>
  )
}
