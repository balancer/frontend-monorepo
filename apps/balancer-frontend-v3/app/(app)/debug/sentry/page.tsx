'use client'

import { Button, Center } from '@chakra-ui/react'
import { SentryError, ensureError } from '@/lib/shared/utils/errors'

export default function Page() {
  function throwError() {
    try {
      throw new Error('Something low level')
    } catch (err) {
      const error = ensureError(err)

      throw new SentryError('Test error', {
        cause: error,
        context: { extra: { some: 'extra context' } },
      })
    }
  }

  return (
    <Center>
      <Button onClick={throwError}>Throw new Error</Button>
    </Center>
  )
}
