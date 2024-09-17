import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
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
          src={`/images/chains/${chain}.svg`}
          alt={`Chain icon for ${chain.toLowerCase()}`}
          width={size}
          height={size}
        />
      </Box>
      <Box
        as={motion.div}
        background="white"
        borderRadius="full"
        position="absolute"
        top="0"
        bottom="0"
        left="0"
        right="0"
        width={`${size}px`}
        height={`${size}px`}
        transform={`scale(${isSmall ? '1.95' : '1.75'})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isChartLoaded ? 0.2 : 0, transition: { delay: 0.2 } }}
        zIndex={1}
      />
      <Box
        as={motion.div}
        background="white"
        borderRadius="full"
        position="absolute"
        top="0"
        bottom="0"
        left="0"
        right="0"
        width={`${size}px`}
        height={`${size}px`}
        transform={`scale(${isSmall ? '2.35' : '2.15'})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isChartLoaded ? 0.1 : 0, transition: { delay: 0.45 } }}
        zIndex={1}
      />
    </Box>
  )
}
