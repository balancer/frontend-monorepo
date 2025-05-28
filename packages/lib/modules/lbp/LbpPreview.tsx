'use client'

import {
  VStack,
  Heading,
  Card,
  CardHeader,
  HStack,
  GridItem,
  Grid,
  Image,
  CardBody,
  Text,
  Circle,
  Button,
  Flex,
  Spacer,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
} from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useLbpForm } from './LbpFormProvider'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { Plus } from 'react-feather'
import { LearnMoreModal } from './header/LearnMoreModal'
import { Controller } from 'react-hook-form'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'

export function LbpPreview() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    saleStructureForm: { watch },
  } = useLbpForm()

  const {
    projectInfoForm: {
      control,
      formState: { errors },
      watch: watchInfo,
    },
  } = useLbpForm()

  const chain = watch('selectedChain')
  const tokenAddress = watch('launchTokenAddress')

  const tokenMetadata = useTokenMetadata(tokenAddress, chain)

  const tokenIconURL = watchInfo('tokenIconUrl')

  return (
    <>
      <NoisyCard
        cardProps={{
          w: 'full',
          overflow: 'hidden',
        }}
      >
        <VStack align="start" p="lg" spacing="lg" w="full">
          <Flex w="full">
            <Heading color="font.maxContrast" size="md">
              LBP Preview
            </Heading>
            <Spacer />
            <Button
              _hover={{ color: 'font.linkHover' }}
              color="font.link"
              position="relative"
              top="4px"
              variant="ghost"
              onClick={onOpen}
            >
              Get help
            </Button>
          </Flex>
          <Card>
            <CardHeader>
              <HStack justify="space-between" w="full">
                <Heading size="sm">Token summary</Heading>
                <NetworkIcon bg="background.level4" chain={chain} shadow="lg" size={8} />
              </HStack>
            </CardHeader>
            <CardBody>
              <Grid gap={0} templateColumns="1fr 1fr">
                <GridItem borderRightColor="background.level0" borderRightWidth="1px" pr="md">
                  <HStack spacing="md">
                    <Popover placement="top" trigger="click">
                      <PopoverTrigger>
                        <Circle
                          bg="background.level4"
                          color="font.secondary"
                          shadow="lg"
                          size={24}
                          role="button"
                        >
                          <VStack>
                            {tokenIconURL ? (
                              <Image src={tokenIconURL} borderRadius="full" />
                            ) : (
                              <Plus />
                            )}
                          </VStack>
                        </Circle>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow bg="background.level3" />
                        <PopoverHeader color="font.primary">Token logo URL</PopoverHeader>
                        <PopoverBody>
                          <Controller
                            control={control}
                            name="tokenIconUrl"
                            render={({ field }) => (
                              <InputWithError
                                error={errors.tokenIconUrl?.message}
                                isInvalid={!!errors.tokenIconUrl}
                                onChange={e => field.onChange(e.target.value)}
                                placeholder="https://yourdomain.com/token-icon.svg"
                                value={field.value}
                              />
                            )}
                          />
                          <Text color="font.secondary" fontSize="sm">
                            Ideally SVG (or PNG / JPG)
                          </Text>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                    <VStack align="start" spacing="xs">
                      <Text fontSize="xl" fontWeight="bold">
                        {tokenMetadata?.symbol ?? 'Token symbol'}
                      </Text>
                      <Text>{tokenMetadata?.name ?? 'Token name'}</Text>
                    </VStack>
                  </HStack>
                </GridItem>
                <GridItem borderLeftColor="background.level4" borderLeftWidth="1px" pl="md">
                  <Grid templateColumns="1fr 1fr">
                    <GridItem>
                      <VStack align="start">
                        <Text color="font.secondary">Holders:</Text>
                        <Text color="font.secondary">Total supply:</Text>
                        <Text color="font.secondary">Creation date:</Text>
                        <Text color="font.secondary">Creation wallet:</Text>
                      </VStack>
                    </GridItem>
                    <GridItem>
                      <VStack align="start">
                        <Text>???</Text>
                        <Text>
                          {tokenMetadata?.totalSupply
                            ? fNum('token', tokenMetadata?.totalSupply)
                            : '-'}
                        </Text>
                        <Text>???</Text>
                        <Text>???</Text>
                      </VStack>
                    </GridItem>
                  </Grid>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        </VStack>
      </NoisyCard>

      <LearnMoreModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
