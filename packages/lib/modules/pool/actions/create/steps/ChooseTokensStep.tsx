import { VStack } from '@chakra-ui/react'
import { PoolFormAction } from '../PoolFormAction'

export function ChooseTokensStep() {
  return (
    <form style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        <PoolFormAction disabled={true} />
      </VStack>
    </form>
  )
}
