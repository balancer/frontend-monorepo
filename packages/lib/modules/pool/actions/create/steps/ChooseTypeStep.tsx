import {
  VStack,
  Heading,
  Text,
  Card,
  SimpleGrid,
  Checkbox,
  HStack,
  RadioGroup,
  Stack,
  Radio,
} from '@chakra-ui/react'
import Image from 'next/image'
import { ProjectConfigBalancer } from '@repo/lib/config/projects/balancer'
import { ProjectConfigBeets } from '@repo/lib/config/projects/beets'
import { capitalize } from 'lodash'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { poolTypes, protocolOptions } from '../helpers'
import { usePoolForm } from '../PoolFormProvider'
import { ProjectConfig } from '@repo/lib/config/config.types'
import { type SubmitHandler, Controller, Control } from 'react-hook-form'
import { type PoolConfig } from '../PoolFormProvider'

export function ChooseTypeStep() {
  const {
    poolConfigForm: { handleSubmit, control, watch, setValue },
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
  }

  const onSubmit: SubmitHandler<PoolConfig> = () => {
    setActiveStep(activeStepIndex + 1)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
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
      </VStack>
    </form>
  )
}

function ChooseProtocol({
  handleChooseProtocol,
  selectedProtocol,
}: {
  selectedProtocol: ProjectConfig['projectId']
  handleChooseProtocol: (protocolId: ProjectConfig['projectId']) => void
}) {
  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary">Choose protocol</Text>
      <SimpleGrid columns={3} spacing="md" w="full">
        {protocolOptions.map(({ id, name, imageSrc }) => (
          <Card
            backgroundColor={selectedProtocol === id ? 'rgba(0, 211, 149, 0.05)' : 'transparent'}
            border={selectedProtocol === id ? '2px solid' : '1px solid'}
            borderColor={selectedProtocol === id ? 'green.500' : 'transparent'}
            cursor="pointer"
            display="flex"
            gap="sm"
            key={id}
            onClick={() => handleChooseProtocol(id)}
          >
            <VStack spacing="sm">
              <Image alt={`${name} logo`} height={80} src={imageSrc} width={80} />
              <Text>{name}</Text>
            </VStack>
          </Card>
        ))}
      </SimpleGrid>
    </VStack>
  )
}

function ChooseNetwork({
  control,
  networkOptions,
}: {
  control: Control<PoolConfig>
  networkOptions: GqlChain[]
}) {
  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary">Choose network</Text>
      <Controller
        control={control}
        name="network"
        render={({ field }) => (
          <SimpleGrid columns={2} spacing="md" w="full">
            {networkOptions.map(network => (
              <Card padding="0">
                <Checkbox
                  flexDirection="row-reverse"
                  gap="md"
                  isChecked={field.value === network}
                  justifyContent="space-between"
                  onChange={e => {
                    if (e.target.checked) {
                      field.onChange(network)
                    }
                  }}
                  padding="sm"
                >
                  <HStack spacing="sm">
                    <NetworkIcon chain={network} size={8} />
                    <Text fontWeight="bold">{capitalize(network)}</Text>
                  </HStack>
                </Checkbox>
              </Card>
            ))}
          </SimpleGrid>
        )}
        rules={{
          required: 'Please select a network',
        }}
      />
    </VStack>
  )
}

function ChoosePoolType({ control }: { control: Control<PoolConfig> }) {
  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary">Choose a pool type</Text>
      <Controller
        control={control}
        name="poolType"
        render={({ field }) => (
          <RadioGroup onChange={field.onChange} value={field.value}>
            <Stack spacing={3}>
              {poolTypes.map(poolType => (
                <Radio key={poolType.value} size="lg" value={poolType.value}>
                  <Text
                    color="font.primary"
                    textDecoration="underline"
                    textDecorationStyle="dotted"
                    textDecorationThickness="1px"
                    textUnderlineOffset="3px"
                  >
                    {poolType.label}
                  </Text>
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        )}
        rules={{
          required: 'Please select a pool type',
        }}
      />
    </VStack>
  )
}
