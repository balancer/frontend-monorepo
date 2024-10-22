'use client'

import { Alert, AlertDescription, AlertIcon, AlertProps, AlertTitle, Box } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { XCircle } from 'react-feather'

type Props = AlertProps & {
  title?: string
}

export function ErrorAlert({ title, children, ...rest }: PropsWithChildren<Props>) {
  return (
    <Alert mb="0" rounded="md" status="error" {...rest}>
      <AlertIcon as={XCircle} boxSize="1.5em" />
      <Box maxHeight="160" ml="md" overflowY="auto" paddingRight="2">
        {title && <AlertTitle color="black">{title}</AlertTitle>}
        <AlertDescription>{children}</AlertDescription>
      </Box>
    </Alert>
  )
}
