'use client'

import { Alert, AlertRootProps, Box } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { XCircle } from 'react-feather'

type Props = AlertRootProps & {
  title?: string
}

export function ErrorAlert({ title, children, ...rest }: PropsWithChildren<Props>) {
  return (
    <Alert.Root mb="0" rounded="md" status="error" {...rest}>
      <Alert.Indicator asChild boxSize="1.5em">
        <XCircle />
      </Alert.Indicator>
      <Box maxHeight="160" ml="md" overflowY="auto" paddingRight="2">
        {title && <Alert.Title color="black">{title}</Alert.Title>}
        <Alert.Description>{children}</Alert.Description>
      </Box>
    </Alert.Root>
  )
}
