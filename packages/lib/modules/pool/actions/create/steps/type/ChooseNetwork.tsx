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
import { INITIAL_POOL_CREATION_FORM } from '../../constants'
import { isCowProtocol } from '../../helpers'
import { useWatch } from 'react-hook-form'

export function ChooseNetwork({ control }: { control: Control<PoolCreationForm> }) {
  const { poolCreationForm } = usePoolCreationForm()

  const [protocol, poolType] = useWatch({ control, name: ['protocol', 'poolType'] })

  const { supportedNetworks, cowSupportedNetworks } = PROJECT_CONFIG

  const protocolNetworks = isCowProtocol(protocol) ? cowSupportedNetworks : supportedNetworks

  const networkOptions: RadioCardOption<GqlChain>[] = [
    protocolNetworks[0],
    ...protocolNetworks.slice(1).sort(),
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
      <Text color="font.primary" fontWeight="bold">
        Choose network
      </Text>
      <Controller
        control={control}
        name="network"
        render={({ field }) => (
          <RadioCardGroup
            name={field.name}
            onChange={(value: GqlChain) => {
              field.onChange(value)
              poolCreationForm.reset({
                ...INITIAL_POOL_CREATION_FORM,
                network: value,
                protocol,
                poolType,
              })
            }}
            options={networkOptions}
            radioCardProps={{
              containerProps: {
                _checked: {
                  borderColor: 'green.400 !important',
                  bg: '#63F2BE0D',
                  color: 'font.opposite',
                },
                _focus: {
                  boxShadow: 'outline',
                },
                borderColor: 'transparent',
                borderRadius: 'lg',
                borderWidth: '1px',
                boxShadow: 'md',
                bg: 'background.level2',
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
