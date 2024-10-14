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
      <Box pb={{ base: 'md', md: 'lg' }} w="full" maxW="4xl" m="auto">
        <Heading textAlign={{ base: 'left', md: 'center' }} w="full" display="block">
          Feature comparison
        </Heading>
      </Box>
      <Card textAlign="left" mb="xl">
        <TableContainer>
          <Table variant="unstyled" className="feature-table">
            <Thead>
              <Tr>
                <Th pt="xs">Balancer pools</Th>
                <Th pt="xs" textAlign="right" mx="xs">
                  <Text fontSize="xs" fontWeight="bold" pr="xs">
                    v2
                  </Text>
                </Th>
                <Th pt="xs" textAlign="right" mx="xs">
                  <Text fontSize="xs" fontWeight="bold" pr="xs">
                    v3
                  </Text>
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              <Tr>
                <Td colSpan={3} padding={0}>
                  <Divider pt="sm" mb="sm" />
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack position="relative" width="max-content" gap="xs" role="group">
                      <Text display="inline">Reusable hooks</Text>

                      <Box
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                      ></Box>
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={X} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack position="relative" width="max-content" gap="xs" role="group">
                      <Text display="inline">BPT managed by vault</Text>

                      <Box
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                      ></Box>
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={X} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack position="relative" width="max-content" gap="xs" role="group">
                      <Text display="inline">Transient accounting (EIP-1153)</Text>

                      <Box
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                      ></Box>
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={X} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack position="relative" width="max-content" gap="xs" role="group">
                      <Text display="inline">Decimal scaling (managed by vault)</Text>

                      <Box
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                      ></Box>
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={X} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack position="relative" width="max-content" gap="xs" role="group">
                      <Text display="inline">Rate scaling (managed by vault)</Text>

                      <Box
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                      ></Box>
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={X} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack position="relative" width="max-content" gap="xs" role="group">
                      <Text display="inline">Liquidity invariant approximation</Text>

                      <Box
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                      ></Box>
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={X} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack position="relative" width="max-content" gap="xs" role="group">
                      <Text display="inline">Linear pools</Text>

                      <Box
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                      ></Box>
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={X} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack position="relative" width="max-content" gap="xs" role="group">
                      <Text display="inline">Phantom BPT</Text>

                      <Box
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                      ></Box>
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={X} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack position="relative" width="max-content" gap="xs" role="group">
                      <Text display="inline">Internal balances</Text>

                      <Box
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                      ></Box>
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={X} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack position="relative" width="max-content" gap="xs" role="group">
                      <Text display="inline">Rebalancers</Text>

                      <Box
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                      ></Box>
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip
                      label="Custom logic was allowed in v2 but there was no concept of
                                      reusable hooks."
                    >
                      <Circle
                        bg="red.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={X} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
              <Tr>
                <Td position="relative">
                  <Tooltip label="Hooks extend existing pool types at various key points throughout the pool&rsquo;s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.">
                    <HStack position="relative" width="max-content" gap="xs" role="group">
                      <Text display="inline">Flash swaps</Text>

                      <Box
                        as={InfoIcon}
                        display="inline"
                        opacity="0.5"
                        transform="scale(0.9)"
                        transition="all 0.2s ease-out"
                        _groupHover={{ opacity: '1', transform: 'scale(1)' }}
                      ></Box>
                    </HStack>
                  </Tooltip>
                </Td>

                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
                      </Circle>
                    </Tooltip>
                  </Box>
                </Td>
                <Td textAlign="right">
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mx="xxs">
                    <Tooltip label="Balancer v3 introduces reusable hooks.">
                      <Circle
                        bg="green.600"
                        size="5"
                        transition="all 0.2s ease-out"
                        _hover={{
                          transform: 'scale(1.2)',
                        }}
                      >
                        <Box as={Check} size={14} color="white" />
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
