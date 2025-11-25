import { VStack } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PreviewPoolType } from './PreviewPoolType'
import { PreviewPoolTokens } from './PreviewPoolTokens'
import { PreviewPoolTokensInWallet } from './PreviewPoolTokensInWallet'
import { PreviewPoolDetails } from './PreviewPoolDetails'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { PreviewPoolHeader } from './PreviewPoolHeader'
import { PreviewPoolChart } from './PreviewPoolChart'

export function PreviewPoolCreation() {
  const {
    poolCreationForm: { control },
  } = usePoolCreationForm()

  return (
    <NoisyCard
      cardProps={{
        w: 'full',
        overflow: 'hidden',
        rounded: 'xl',
      }}
    >
      <VStack align="start" p="lg" spacing="md" w="full">
        <PreviewPoolHeader control={control} />
        <PreviewPoolType control={control} />
        <PreviewPoolChart control={control} />
        <PreviewPoolTokens control={control} />
        <PreviewPoolTokensInWallet control={control} />
        <PreviewPoolDetails control={control} />
      </VStack>
    </NoisyCard>
  )
}
