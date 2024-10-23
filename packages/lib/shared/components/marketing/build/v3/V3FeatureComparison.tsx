/* eslint-disable max-len */
import {
  Card,
  Divider,
  Heading,
  Text,
  Box,
  Circle,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tooltip,
} from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { X, Check } from 'react-feather'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'

export function V3FeatureComparison() {
  return (
    <FadeInOnView>
      <Box m="auto" maxW="4xl" pb={{ base: 'md', md: 'lg' }} w="full">
        <Heading display="block" textAlign={{ base: 'left', md: 'center' }} w="full">
          Feature comparison
        </Heading>
      </Box>
      <Card mb="xl" textAlign="left">
        <TableContainer>
          <Table className="feature-table" variant="unstyled">
            <Thead>
              <Tr>
                <Th pt="xs">Balancer pools</Th>
                <Th mx="xs" pt="xs" textAlign="right">
                  <Text fontSize="xs" fontWeight="bold" pr="xs">
                    v2
                  </Text>
                </Th>
                <Th mx="xs" pt="xs" textAlign="right">
                  <Text fontSize="xs" fontWeight="bold" pr="xs">
                    v3
                  </Text>
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              <Tr>
                <Td colSpan={3} padding={0}>
                  <Divider mb="sm" pt="sm" />
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack gap="xs" position="relative" role="group" width="max-content">
                      <Text display="inline">Reusable hooks</Text>

                      <Box
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                      />
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={X} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack gap="xs" position="relative" role="group" width="max-content">
                      <Text display="inline">BPT managed by vault</Text>

                      <Box
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                      />
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={X} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack gap="xs" position="relative" role="group" width="max-content">
                      <Text display="inline">Transient accounting (EIP-1153)</Text>

                      <Box
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                      />
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={X} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack gap="xs" position="relative" role="group" width="max-content">
                      <Text display="inline">Decimal scaling (managed by vault)</Text>

                      <Box
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                      />
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={X} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack gap="xs" position="relative" role="group" width="max-content">
                      <Text display="inline">Rate scaling (managed by vault)</Text>

                      <Box
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                      />
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={X} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack gap="xs" position="relative" role="group" width="max-content">
                      <Text display="inline">Liquidity invariant approximation</Text>

                      <Box
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                      />
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={X} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack gap="xs" position="relative" role="group" width="max-content">
                      <Text display="inline">Linear pools</Text>

                      <Box
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                      />
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={X} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack gap="xs" position="relative" role="group" width="max-content">
                      <Text display="inline">Phantom BPT</Text>

                      <Box
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                      />
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={X} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack gap="xs" position="relative" role="group" width="max-content">
                      <Text display="inline">Internal balances</Text>

                      <Box
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                      />
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={X} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack gap="xs" position="relative" role="group" width="max-content">
                      <Text display="inline">Rebalancers</Text>

                      <Box
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                      />
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={X} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack gap="xs" position="relative" role="group" width="max-content">
                      <Text display="inline">Flash swaps</Text>

                      <Box
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                      />
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
                <Td textAlign="right">
                  <Box alignItems="center" display="flex" justifyContent="flex-end" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                      >
                        <Box as={Check} color="white" size={14} />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Card>
    </FadeInOnView>
  )
}
