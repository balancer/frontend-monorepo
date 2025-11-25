import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { PoolCreationForm } from '../types'
import { useWatch, Control } from 'react-hook-form'
import { HStack, Heading } from '@chakra-ui/react'
import { RestartPoolCreationModal } from '../modal/RestartPoolCreationModal'
import { getGqlPoolType } from '../helpers'
import { LearnMoreModal } from '@repo/lib/shared/components/modals/LearnMoreModal'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function PreviewPoolHeader({ control }: { control: Control<PoolCreationForm> }) {
  const [network, poolType] = useWatch({ control, name: ['network', 'poolType'] })
  const { resetPoolCreationForm } = usePoolCreationForm()

  return (
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
        <LearnMoreModal
          buttonLabel="Get help"
          docsUrl="https://docs.balancer.fi/concepts/explore-available-balancer-pools/"
          headerText="Learn more about pool types"
          listItems={[
            `${PROJECT_CONFIG.projectName} offers a variety of liquidity pool types, each tailored to specific use cases`,
          ]}
        />
      </HStack>
    </HStack>
  )
}
