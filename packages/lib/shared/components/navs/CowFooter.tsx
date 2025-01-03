'use client'

import { PartnerVariant } from '@repo/lib/modules/pool/pool.types'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { Box, Button, Center, Text, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import { useProjectConfig } from '@repo/lib/config/ProjectConfigProvider'

export function CowFooter() {
  const { variantConfig } = useProjectConfig()
  const { banners } = variantConfig?.[PartnerVariant.cow] || {}

  return (
    <>
      <Center>
        <VStack>
          <Text color="grayText">{`Can't find the pool you're looking for?`}</Text>
          <Button as={Link} href="https://pool-creator.balancer.fi/cow" rel="" target="_blank">
            Create a pool
          </Button>
        </VStack>
      </Center>
      <Box position="relative" zIndex="-1">
        <FadeInOnView animateOnce={false}>
          <Box maxW="maxContent" mx="auto" pt="xl" px={{ base: '0', '2xl': 'md' }} zIndex="0">
            {banners?.footerSrc && (
              <Picture
                altText="CoW AMM footer"
                defaultImgType="svg"
                directory="/images/partners/"
                imgName="cow-footer"
                imgSvg
                imgSvgDark
                imgSvgPortrait
                imgSvgPortraitDark
              />
            )}
          </Box>
        </FadeInOnView>
      </Box>
    </>
  )
}
