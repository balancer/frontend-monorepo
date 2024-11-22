'use client'
import { HStack, Heading, VStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { Link } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

export default function DebugPools() {
  return (
    <FadeInOnView>
      <HStack align="start" mx="auto" spacing="24px" width="80%">
        <VStack align="start" margin="lg" padding="lg">
          <Heading size="md">Debug V3 pools</Heading>
          <Link as={NextLink} href="/pools/sepolia/v3/0xce701deac1b660da4ee05f6f3f7cbafddb6a79fe">
            Sepolia WEIGHTED (Balancer 50 BAL 50 DAI-aave)
          </Link>
          <Link as={NextLink} href="/pools/sepolia/v3/0x75F49D54978d08E4E76a873dA6c78E8f6b2901C2">
            Sepolia WEIGHTED with Proportional joins (Balancer 50 BAL 50 WETH -ExitFee Hook)
          </Link>
          <Link as={NextLink} href="/pools/sepolia/v3/0x6dbdd7a36d900083a5b86a55583d90021e9f33e8">
            Sepolia reference BOOSTED pool (Balancer USDC/USDT)
          </Link>
          <Link as={NextLink} href="/pools/sepolia/v3/0x0270daf4ee12ccb1abc8aa365054eecb1b7f4f6b">
            Sepolia reference NESTED pool (Balancer 50 WETH 50 USD)
          </Link>
        </VStack>

        <VStack align="start" margin="lg" padding="lg">
          <Heading size="md">Debug V2 pools</Heading>
          <Link
            as={NextLink}
            href="/pools/ethereum/v2/0x68e3266c9c8bbd44ad9dca5afbfe629022aee9fe000200000000000000000512"
          >
            Mainnet WEIGHTED (wjAura-weth)
          </Link>
          <Link
            as={NextLink}
            href="/pools/ethereum/v2/0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080"
          >
            Mainnet META_STABLE (wstETH_wETH)
          </Link>
          <Link
            as={NextLink}
            href="/pools/ethereum/v2/0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112"
          >
            Mainnet STABLE (B-rETH-STABLE in Mainnet)
          </Link>
          <Link
            as={NextLink}
            href="/pools/ethereum/v2/0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249"
          >
            Mainnet STABLE with BPT tokens (AuraBal 80/20 pool in Mainnet)
          </Link>
          <Link
            as={NextLink}
            href="/pools/optimism/v2/0x3dc09db8e571da76dd04e9176afc7feee0b89106000000000000000000000019"
          >
            Optimism STABLE (FRAX_USDC_MAI)
          </Link>
          <Link
            as={NextLink}
            href="/pools/ethereum/v2/0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0"
          >
            Mainnet NESTED (50WETH-50-3pool)
          </Link>
          <Link
            as={NextLink}
            href="/pools/gnosis/v2/0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053"
          >
            Gnosis NESTED (Balancer staBAL3-WETH-WBTC)
          </Link>
          <Link
            as={NextLink}
            href="/pools/ethereum/v2/0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053"
          >
            Mainnet GYRO (2CLP-WSTETH-WETH)
          </Link>
          <Link
            as={NextLink}
            href="/pools/polygon/v2/0xee278d943584dd8640eaf4cc6c7a5c80c0073e85000200000000000000000bc7"
          >
            Polygon GYRO (2CLP_WMATIC/MATICX)
          </Link>
          <Link
            as={NextLink}
            href="/pools/ethereum/v2/0x0da692ac0611397027c91e559cfd482c4197e4030002000000000000000005c9"
          >
            Mainnet WEIGHTED recovery mode (not paused)
          </Link>
          <Link
            as={NextLink}
            href="/pools/ethereum/v2/0x156c02f3f7fef64a3a9d80ccf7085f23cce91d76000000000000000000000570"
          >
            Mainnet COMPOSABLE_STABLE recovery mode (not paused)
          </Link>
          <Link
            as={NextLink}
            href="/pools/ethereum/v2/0xae8535c23afedda9304b03c68a3563b75fc8f92b0000000000000000000005a0"
          >
            Mainnet COMPOSABLE_STABLE Bricked (in recovery mode and paused)
          </Link>
          <Link
            as={NextLink}
            href="/pools/fraxtal/v2/0x33251abecb0364df98a27a8d5d7b5ccddc774c42000000000000000000000008"
          >
            Frax with Merkl APR items
          </Link>
          <Link
            as={NextLink}
            href="/pools/ethereum/v2/0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe"
          >
            Old mainnet boosted pool with issues
          </Link>
        </VStack>

        <VStack align="start" margin="lg" padding="lg">
          <Heading size="md">Debug CoW AMM (V1) pools</Heading>
          <Link as={NextLink} href="/pools/gnosis/cow/0x079d2094e16210c42457438195042898a3cff72d">
            Gnosis CoW AMM
          </Link>
        </VStack>
      </HStack>
    </FadeInOnView>
  )
}
