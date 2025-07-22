import {
  Card,
  CardBody,
  CardHeader,
  Circle,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  VStack,
} from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { Plus } from 'react-feather'
import { Controller, UseFormReturn } from 'react-hook-form'
import { ProjectInfoForm } from '../../lbp.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'

type Props = {
  chain: GqlChain
  projectInfoForm: UseFormReturn<ProjectInfoForm>
  launchTokenMetadata: ReturnType<typeof useTokenMetadata>
}

export function TokenSummary({ chain, projectInfoForm, launchTokenMetadata }: Props) {
  const tokenIconURL = projectInfoForm.watch('tokenIconUrl')
  const hasIconErrors = projectInfoForm.formState.errors.tokenIconUrl !== undefined

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between" w="full">
          <Heading size="sm">Token summary</Heading>
          <NetworkIcon bg="background.level4" chain={chain} shadow="lg" size={8} />
        </HStack>
      </CardHeader>
      <CardBody>
        <Grid gap={{ base: 3, xl: 0 }} templateColumns={{ base: 'repeat(1, 1fr)', xl: '1fr 1fr' }}>
          <GridItem borderRightColor="background.level0" borderRightWidth="1px" pr="md">
            <HStack spacing="md">
              <Popover placement="top" trigger="click">
                <PopoverTrigger>
                  <Circle
                    bg="background.level4"
                    color="font.secondary"
                    role="button"
                    shadow="lg"
                    size={24}
                  >
                    <VStack>
                      {tokenIconURL && !hasIconErrors ? (
                        <Image borderRadius="full" src={tokenIconURL} />
                      ) : (
                        <Plus />
                      )}
                    </VStack>
                  </Circle>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow bg="background.level3" />
                  <PopoverHeader color="font.primary" fontWeight="bold">
                    Add the token logo
                  </PopoverHeader>
                  <PopoverBody>
                    <Controller
                      control={projectInfoForm.control}
                      name="tokenIconUrl"
                      render={({ field }) => (
                        <InputWithError
                          error={projectInfoForm.formState.errors.tokenIconUrl?.message}
                          isInvalid={!!projectInfoForm.formState.errors.tokenIconUrl}
                          onChange={e => field.onChange(e.target.value)}
                          placeholder="https://yourdomain.com/token-icon.svg"
                          value={field.value}
                        />
                      )}
                    />
                    <Text color="font.secondary" fontSize="12px" pt="sm">
                      Add a URL to an image file (e.g. SVG, PNG, JPG)
                    </Text>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <VStack align="start" spacing="xs">
                <Text fontSize="xl" fontWeight="bold">
                  {launchTokenMetadata?.symbol ?? 'Token symbol'}
                </Text>
                <Text>{launchTokenMetadata?.name ?? 'Token name'}</Text>
              </VStack>
            </HStack>
          </GridItem>
          <GridItem
            alignSelf="center"
            borderLeftColor="background.level4"
            borderLeftWidth="1px"
            pl="md"
          >
            <Grid templateColumns="1fr 1fr">
              <GridItem>
                <VStack align="start">
                  <Text color="font.secondary" fontSize="sm">
                    Total token supply:
                  </Text>
                  <Text color="font.secondary" fontSize="sm">
                    My wallet balance:
                  </Text>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack align="start">
                  <Text fontSize="sm">
                    {launchTokenMetadata?.totalSupply
                      ? fNum('token', launchTokenMetadata?.totalSupply)
                      : '-'}
                  </Text>
                  <Text fontSize="sm">TBD</Text>
                </VStack>
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  )
}
