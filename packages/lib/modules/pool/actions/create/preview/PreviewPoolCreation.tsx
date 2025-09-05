import { VStack, Heading, HStack } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PreviewPoolType } from './PreviewPoolType'
import { PreviewPoolTokens } from './PreviewPoolTokens'
import { PreviewPoolTokensInWallet } from './PreviewPoolTokensInWallet'
import { PreviewPoolDetails } from './PreviewPoolDetails'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { usePoolCreationFormSteps } from '../usePoolCreationFormSteps'
import { RestartPoolCreationModal } from '../modal/RestartPoolCreationModal'
import { getGqlPoolType } from '../helpers'
import { LearnMoreModal } from '@repo/lib/modules/lbp/header/LearnMoreModal'

export function PreviewPoolCreation() {
  const { resetPoolCreationForm, network, poolType } = usePoolCreationForm()
  const { isBeforeStep } = usePoolCreationFormSteps()

  return (
    <NoisyCard
      cardProps={{
        w: 'full',
        overflow: 'hidden',
        rounded: 'xl',
      }}
    >
      <VStack align="start" p="lg" spacing="md" w="full">
        <HStack alignItems="center" justifyContent="space-between" w="full">
          <Heading color="font.maxContrast" size="md">
            Pool preview
          </Heading>
          <HStack cursor="pointer" spacing="xs" zIndex={1}>
            <RestartPoolCreationModal
              handleRestart={resetPoolCreationForm}
              network={network}
              poolType={getGqlPoolType(poolType)}
            />
            <LearnMoreModal buttonLabel="Get help" />
          </HStack>
        </HStack>

        <PreviewPoolType />
        <PreviewPoolTokens isBeforeStep={isBeforeStep('Tokens')} />
        <PreviewPoolTokensInWallet isBeforeStep={isBeforeStep('Tokens')} />
        <PreviewPoolDetails isBeforeStep={isBeforeStep('Details')} />
      </VStack>
    </NoisyCard>
  )
}
