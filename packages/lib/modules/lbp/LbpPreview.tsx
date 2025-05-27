'use client'

import {
  VStack,
  Heading,
  Card,
  CardHeader,
  HStack,
  GridItem,
  Grid,
  CardBody,
  Text,
  Circle,
  Button,
  Flex,
  Spacer,
  useDisclosure,
} from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useLbpForm } from './LbpFormProvider'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { Image } from 'react-feather'
import { LearnMoreModal } from './header/LearnMoreModal'

export function LbpPreview() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    saleStructureForm: { watch },
  } = useLbpForm()

  const chain = watch('selectedChain')
  const tokenAddress = watch('launchTokenAddress')

  const tokenMetadata = useTokenMetadata(tokenAddress, chain)

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
                    <Circle bg="background.level4" color="font.secondary" shadow="lg" size={24}>
                      <Image />
                    </Circle>
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
                        <Text color="font.secondary">Total supply:</Text>
                        <Text color="font.secondary">Decimals:</Text>
                      </VStack>
                    </GridItem>
                    <GridItem>
                      <VStack align="start">
                        <Text>
                          {tokenMetadata?.totalSupply
                            ? fNum('token', tokenMetadata?.totalSupply)
                            : '-'}
                        </Text>
                        <Text>{tokenMetadata?.decimals ?? '-'}</Text>
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
