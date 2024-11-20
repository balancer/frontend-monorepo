import { VStack, Card, HStack, Text } from '@chakra-ui/react'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertContent } from '@repo/lib/shared/components/alerts/BalAlertContent'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePool } from '../pool/PoolProvider'

export function PoolSwapCard() {
  const { pool } = usePool()
  return (
    <VStack>
      <BalAlert
        content={
          <BalAlertContent
            // eslint-disable-next-line max-len
            description="This swap routes through a single pool only. Better rates are usually available through the standard swap UI."
            forceColumnMode
            title="Direct single pool swap (expert option)"
          />
        }
        status="warning"
      />
      <Card h="full">
        <HStack>
          <NetworkIcon chain={pool.chain} size={6} />
          <Text>{pool.name} (swap route)</Text>
        </HStack>
      </Card>
    </VStack>
  )
}
