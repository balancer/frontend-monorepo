import { Heading, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'

export default function ReliquaryConnectWallet() {
  return (
    <VStack
      alignItems="center"
      animate={{ opacity: 1, transition: { delay: 1 } }}
      as={motion.div}
      exit={{ opacity: 0 }}
      height="100%"
      initial={{ opacity: 0 }}
      justifyContent="center"
      spacing="4"
      width="100%"
    >
      <Heading flexGrow="1" size="md">
        Get started by connecting your wallet
      </Heading>
      <ConnectWallet size="lg" variant="primary" />
    </VStack>
  )
}
