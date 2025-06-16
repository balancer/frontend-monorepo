import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Center, HStack, ModalHeader, VStack, Text, Link, useColorMode } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode } from 'react'
import { ArrowUpRight, Check } from 'react-feather'
import { Hash } from 'viem'
import { getBlockExplorerTxUrl } from '../../utils/blockExplorer'

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
  timeout?: ReactNode
  isReceiptLoading?: boolean
}) {
  const { colorMode } = useColorMode()
  return (
    <ModalHeader>
      <HStack justify="space-between" pr="lg" w="full">
        <AnimatePresence initial={false} mode="wait">
          {!txHash || isReceiptLoading ? (
            <>
              <span>{label}</span>
              {timeout || null}
            </>
          ) : (
            <HStack spacing="md">
              <motion.div
                animate={{ opacity: [0, 0.7, 1], scale: [0, 1.2, 1] }}
                initial={{ opacity: 0, scale: 0 }}
                transition={{ duration: 1, times: [0, 0.7, 1], ease: 'easeInOut' }}
              >
                <Center
                  bg="font.highlight"
                  color={colorMode === 'dark' ? 'font.dark' : 'white'}
                  fontWeight="bold"
                  h={10}
                  rounded="full"
                  w={10}
                >
                  <Check size={18} strokeWidth={4} />
                </Center>
              </motion.div>

              <motion.div
                animate={{ x: [-20, 0] }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <VStack align="start" spacing="none">
                  <Text fontSize="xl" fontWeight="bold">
                    Transaction confirmed
                  </Text>
                  <HStack spacing="xxs">
                    <Text color="grayText" fontSize="sm">
                      View details on explorer
                    </Text>
                    <Link
                      color="grayText"
                      href={getBlockExplorerTxUrl(txHash, chain)}
                      left="-1px"
                      position="relative"
                      target="_blank"
                      top="1px"
                    >
                      <ArrowUpRight size={14} />
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
