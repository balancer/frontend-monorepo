import { useBlockExplorer } from '@/lib/shared/hooks/useBlockExplorer'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { Center, HStack, ModalHeader, VStack, Text, Link } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { ArrowUpRight, Check } from 'react-feather'
import { Hash } from 'viem'

export function TransactionModalHeader({
  label,
  timeout,
  txHash,
  chain,
  // true by default for flows that do not have a receipt
  isReceiptLoading = true,
}: {
  label: string
  txHash?: Hash
  chain: GqlChain
  timeout?: React.ReactNode
  isReceiptLoading?: boolean
}) {
  const { getBlockExplorerTxUrl } = useBlockExplorer(chain)

  return (
    <ModalHeader>
      <HStack justify="space-between" w="full" pr="lg">
        <AnimatePresence mode="wait" initial={false}>
          {!txHash || isReceiptLoading ? (
            <>
              <span>{label}</span>
              {timeout || null}
            </>
          ) : (
            <HStack spacing="md">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.7, 1], scale: [0, 1.2, 1] }}
                transition={{ duration: 1, times: [0, 0.7, 1], ease: 'easeInOut' }}
              >
                <Center w={10} h={10} rounded="full" bg="green.500" color="white" fontWeight="bold">
                  <Check size={18} strokeWidth={4} />
                </Center>
              </motion.div>

              <motion.div
                animate={{ x: [-20, 0] }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <VStack align="start" spacing="none">
                  <Text fontSize="xl">Transaction confirmed</Text>
                  <HStack spacing="xs">
                    <Text color="grayText" fontSize="sm">
                      View details on explorer
                    </Text>
                    <Link href={getBlockExplorerTxUrl(txHash)} target="_blank" color="grayText">
                      <ArrowUpRight size={16} />
                    </Link>
                  </HStack>
                </VStack>
              </motion.div>
            </HStack>
          )}
        </AnimatePresence>
      </HStack>
    </ModalHeader>
  )
}
