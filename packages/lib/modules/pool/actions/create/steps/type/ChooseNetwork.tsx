import { Control } from 'react-hook-form'
import { type PoolCreationForm } from '../../constants'
import { VStack, Text, SimpleGrid, Card, Checkbox, HStack } from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { capitalize } from 'lodash'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { ProjectConfigBalancer } from '@repo/lib/config/projects/balancer'
import { ProjectConfigBeets } from '@repo/lib/config/projects/beets'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'

export function ChooseNetwork({ control }: { control: Control<PoolCreationForm> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPoolCreationForm } = usePoolCreationForm()

  const updateNetworkParam = (network: GqlChain) => {
    const params = new URLSearchParams(searchParams)
    params.set('network', network)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  let networkOptions: GqlChain[]

  if (PROJECT_CONFIG.projectId === ProjectConfigBalancer.projectId) {
    // balancer v3 pool creation not yet supported on these networks
    networkOptions = ProjectConfigBalancer.supportedNetworks.filter(
      network =>
        ![
          GqlChain.Zkevm,
          GqlChain.Mode,
          GqlChain.Fraxtal,
          GqlChain.Optimism,
          GqlChain.Polygon,
        ].includes(network)
    )
  } else if (PROJECT_CONFIG.projectId === ProjectConfigBeets.projectId) {
    networkOptions = ProjectConfigBeets.supportedNetworks
  }

  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary">Choose network</Text>
      <Controller
        control={control}
        name="network"
        render={({ field }) => (
          <SimpleGrid columns={2} spacing="md" w="full">
            {networkOptions.map(network => (
              <Card key={network} padding="0">
                <Checkbox
                  flexDirection="row-reverse"
                  gap="md"
                  isChecked={field.value === network}
                  justifyContent="space-between"
                  onChange={e => {
                    if (e.target.checked) {
                      resetPoolCreationForm()
                      field.onChange(network)
                      updateNetworkParam(network)
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
