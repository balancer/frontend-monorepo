import { Control } from 'react-hook-form'
import { PoolCreationForm } from '../../types'
import {
  VStack,
  Text,
  SimpleGrid,
  HStack,
  Box,
  useRadio,
  useRadioGroup,
  UseRadioProps,
} from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { ReactNode } from 'react'
import { getChainShortName } from '@repo/lib/config/app.config'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'

type RadioOption = {
  label: string
  value: GqlChain
}

type RadioCardGroupProps = {
  name: string
  onChange: (value: GqlChain) => void
  options: RadioOption[]
  value?: GqlChain
}

function RadioCard(props: UseRadioProps & { children: ReactNode }) {
  const { getInputProps, getRadioProps } = useRadio(props)

  const input = getInputProps()
  const radio = getRadioProps()

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...radio}
        _checked={{
          color: 'font.opposite',
          borderColor: 'background.highlight',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        borderRadius="lg"
        borderWidth="2px"
        boxShadow="md"
        cursor="pointer"
        px={5}
        py={3}
        w="full"
      >
        {props.children}
      </Box>
    </Box>
  )
}

function RadioCardGroup({ options, value, onChange, name }: RadioCardGroupProps) {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    value,
    onChange: selected => onChange(selected as GqlChain),
  })

  const group = getRootProps()

  return (
    <SimpleGrid {...group} columns={{ base: 1, sm: 2 }} spacing="md" w="full">
      {options.map(option => {
        const radio = getRadioProps({ value: option.value })
        return (
          <RadioCard key={option.value} {...radio}>
            <HStack spacing="sm">
              <NetworkIcon chain={option.value} size={8} />
              <Text fontWeight="bold">{option.label}</Text>
            </HStack>
          </RadioCard>
        )
      })}
    </SimpleGrid>
  )
}

export function ChooseNetwork({ control }: { control: Control<PoolCreationForm> }) {
  const { resetPoolCreationForm } = usePoolCreationForm()

  const { supportedNetworks } = PROJECT_CONFIG
  const networkOptions = [supportedNetworks[0], ...supportedNetworks.slice(1).sort()]
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
            name={field.name}
            onChange={(value: GqlChain) => {
              resetPoolCreationForm()
              field.onChange(value)
            }}
            options={networkOptions}
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
