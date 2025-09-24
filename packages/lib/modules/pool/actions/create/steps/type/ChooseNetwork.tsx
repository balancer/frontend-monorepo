import { Control } from 'react-hook-form'
import { PoolCreationForm } from '../../types'
import { VStack, Text, HStack } from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { getChainShortName } from '@repo/lib/config/app.config'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import {
  RadioCardGroup,
  type RadioCardOption,
} from '@repo/lib/shared/components/inputs/RadioCardGroup'

export function ChooseNetwork({ control }: { control: Control<PoolCreationForm> }) {
  const { resetPoolCreationForm } = usePoolCreationForm()

  const { supportedNetworks } = PROJECT_CONFIG
  const networkOptions: RadioCardOption<GqlChain>[] = [
    supportedNetworks[0],
    ...supportedNetworks.slice(1).sort(),
  ]
    .filter(
      network =>
        // balancer v3 pool creation not yet supported on these networks
        ![GqlChain.Zkevm, GqlChain.Mode, GqlChain.Fraxtal, GqlChain.Polygon].includes(network)
    )
    .map(network => ({
      value: network,
      label: getChainShortName(network),
    }))

  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary">Choose network</Text>
      <Controller
        control={control}
        name="network"
        render={({ field }) => (
          <RadioCardGroup
            key={field.value ?? 'network'}
            name={field.name}
            onChange={(value: GqlChain) => {
              resetPoolCreationForm()
              field.onChange(value)
            }}
            options={networkOptions}
            radioCardProps={{
              containerProps: {
                _checked: {
                  borderColor: 'background.highlight',
                  color: 'font.opposite',
                },
                _focus: {
                  boxShadow: 'outline',
                },
                borderRadius: 'lg',
                borderWidth: '2px',
                boxShadow: 'md',
                cursor: 'pointer',
                px: 5,
                py: 3,
              },
            }}
            renderOption={({ value, label }) => (
              <HStack spacing="sm">
                <NetworkIcon chain={value} size={8} />
                <Text fontWeight="bold">{label}</Text>
              </HStack>
            )}
            value={field.value}
          />
        )}
        rules={{
          required: 'Please select a network',
        }}
      />
    </VStack>
  )
}
