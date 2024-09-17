'use client'

import { FallbackProps } from 'react-error-boundary'
import { Button, Box, Text, Heading, VStack } from '@chakra-ui/react'
import { ensureError } from '../../utils/errors'
import { DefaultPageContainer } from '../containers/DefaultPageContainer'
import { captureSentryError } from '../../utils/query-errors'

type ErrorWithDigest = Error & {
  digest?: string
}

interface BoundaryErrorProps extends FallbackProps {
  error: ErrorWithDigest
}

export function BoundaryError({ error, resetErrorBoundary }: BoundaryErrorProps) {
  captureSentryError(error, { errorMessage: error.message })

  const _error = ensureError(error)

  return (
    <Box w="full" minH="200px" border="2px dashed" borderColor="red.500" p="md" rounded="lg">
      <VStack align="start" spacing="md">
        <Heading size="md">Something went wrong! :(</Heading>
        <VStack align="start" spacing="xs">
          <Text>
            {_error?.name
              ? `${_error?.name}: ${_error?.shortMessage || ''}`
              : _error?.shortMessage || ''}
          </Text>
          <Text>{_error?.message}</Text>
          <Text>
            Error Digest: {_error?.digest} (this can be passed on to support to help with debugging)
          </Text>
        </VStack>

        <Button size="sm" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </VStack>
    </Box>
  )
}

export function PageErrorBoundary(props: BoundaryErrorProps) {
  return (
    <DefaultPageContainer minH="80vh">
      <BoundaryError {...props} />
    </DefaultPageContainer>
  )
}
