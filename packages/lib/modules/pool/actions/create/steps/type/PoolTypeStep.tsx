import { VStack, Heading, Divider, Box } from '@chakra-ui/react'
import { ProjectConfigBalancer } from '@repo/lib/config/projects/balancer'
import { ProjectConfigBeets } from '@repo/lib/config/projects/beets'
import { usePoolForm } from '../../PoolFormProvider'
import { ProjectConfig } from '@repo/lib/config/config.types'
import { type SubmitHandler } from 'react-hook-form'
import { type PoolConfig } from '../../PoolFormProvider'
import { PoolFormAction } from '../../PoolFormAction'
import { ChooseProtocol } from './ChooseProtocol'
import { ChooseNetwork } from './ChooseNetwork'
import { ChoosePoolType } from './ChoosePoolType'

export function PoolTypeStep() {
  const {
    poolConfigForm: {
      handleSubmit,
      control,
      watch,
      setValue,
      formState: { isValid },
      trigger,
    },
    setActiveStep,
    activeStepIndex,
  } = usePoolForm()
  const poolConfig = watch()

  const { supportedNetworksV3: supportedNetworksBalancer } = ProjectConfigBalancer
  const { supportedNetworks: supportedNetworksBeets } = ProjectConfigBeets
  const networkOptions =
    poolConfig.protocol === ProjectConfigBalancer.projectId
      ? supportedNetworksBalancer
      : supportedNetworksBeets

  const handleChooseProtocol = (protocolId: ProjectConfig['projectId']) => {
    setValue('protocol', protocolId)
    trigger('protocol')
  }

  const onSubmit: SubmitHandler<PoolConfig> = () => {
    setActiveStep(activeStepIndex + 1)
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <VStack align="start" spacing="xl" w="full">
        <Heading color="font.maxContrast" size="md">
          Pool type
        </Heading>
        <ChooseProtocol
          handleChooseProtocol={handleChooseProtocol}
          selectedProtocol={poolConfig.protocol}
        />
        <ChooseNetwork control={control} networkOptions={networkOptions} />
        <ChoosePoolType control={control} />
        <Divider />
        <PoolFormAction disabled={!isValid} />
      </VStack>
    </Box>
  )
}
