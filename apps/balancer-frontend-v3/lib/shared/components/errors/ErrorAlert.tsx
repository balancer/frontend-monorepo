'use client'

import { Alert, AlertDescription, AlertIcon, AlertProps, AlertTitle, Box } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { XCircle } from 'react-feather'

type Props = AlertProps & {
  title?: string
}

export function ErrorAlert({ title, children, ...rest }: PropsWithChildren<Props>) {
  return (
    <Alert rounded="md" status="error" mb="0" {...rest}>
      <AlertIcon as={XCircle} boxSize="1.5em" />
      <Box ml="md" maxHeight="160" overflowY="auto" paddingRight="2">
        {title && <AlertTitle color="black">{title}</AlertTitle>}
        <AlertDescription>{children}</AlertDescription>
      </Box>
    </Alert>
  )
}
