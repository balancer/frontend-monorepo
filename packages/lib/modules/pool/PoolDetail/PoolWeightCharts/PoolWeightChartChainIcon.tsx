import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import Image from 'next/image'

type Props = {
  chain: GqlChain
  isChartLoaded: boolean
  isSmall?: boolean
}
export default function PoolWeightChartChainIcon({ chain, isChartLoaded, isSmall = false }: Props) {
  const size = isSmall ? 25 : 45

  return (
    <Box position="relative">
      <Box zIndex={4}>
        <Image
          alt={`Chain icon for ${chain.toLowerCase()}`}
          height={size}
          src={`/images/chains/${chain}.svg`}
          width={size}
        />
      </Box>
      <Box
        animate={{ opacity: isChartLoaded ? 0.2 : 0, transition: { delay: 0.2 } }}
        as={motion.div}
        background="white"
        borderRadius="full"
        bottom="0"
        height={`${size}px`}
        initial={{ opacity: 0 }}
        left="0"
        position="absolute"
        right="0"
        top="0"
        transform={`scale(${isSmall ? '1.95' : '1.75'})`}
        width={`${size}px`}
        zIndex={1}
      />
      <Box
        animate={{ opacity: isChartLoaded ? 0.1 : 0, transition: { delay: 0.45 } }}
        as={motion.div}
        background="white"
        borderRadius="full"
        bottom="0"
        height={`${size}px`}
        initial={{ opacity: 0 }}
        left="0"
        position="absolute"
        right="0"
        top="0"
        transform={`scale(${isSmall ? '2.35' : '2.15'})`}
        width={`${size}px`}
        zIndex={1}
      />
    </Box>
  )
}
