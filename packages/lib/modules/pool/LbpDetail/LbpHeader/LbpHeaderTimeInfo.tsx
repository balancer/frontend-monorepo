import { HStack, Icon, Text, VStack, Box } from '@chakra-ui/react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { useDateCountdown } from '@repo/lib/shared/hooks/date.hooks'
import { GqlPoolLiquidityBootstrapping } from '@repo/lib/shared/services/api/generated/graphql'
import { format, secondsToMilliseconds } from 'date-fns'
import { Clock } from 'react-feather'

export function LbpHeaderTimeInfo() {
  const { pool } = usePool()

  // this will only be rendered for LBPs so we can be sure it is a liquidity bootstrapping pool
  const lbpPool = pool as GqlPoolLiquidityBootstrapping
  const endTime = lbpPool.endTime ?? 0
  const endTimeFormatted = format(secondsToMilliseconds(endTime), 'haaa MM/dd/yy')

  const { daysDiff, hoursDiff, minutesDiff, secondsDiff } = useDateCountdown(
    new Date(secondsToMilliseconds(endTime))
  )

  const counters = [
    { title: 'D', value: daysDiff },
    { title: 'H', value: hoursDiff },
    { title: 'M', value: minutesDiff },
    { title: 'S', value: secondsDiff },
  ]

  return (
    <HStack w="full" alignItems="start">
      <HStack
        h="full"
        w="full"
        justifyContent="start"
        alignItems="center"
        bg="green.400"
        borderRadius="sm"
        color="black"
        p="2"
      >
        <Icon as={Clock} />
        <Text color="black">{`LBP is live! Ends ${endTimeFormatted}`}</Text>
      </HStack>
      <HStack spacing="xs" w="full" h="48px">
        {counters.map(counter => {
          const displayValue =
            counter.title === 'S' ? String(counter.value).padStart(2, '0') : String(counter.value)

          return (
            <VStack
              key={counter.title}
              position="relative"
              py="xs"
              rounded="lg"
              shadow="2xl"
              spacing="none"
              alignItems="center"
              justifyContent="center"
              minH="100%"
              w="full"
            >
              <Box
                h="full"
                inset={0}
                overflow="hidden"
                position="absolute"
                rounded="lg"
                w="full"
                zIndex={-1}
              >
                <Picture
                  altText="Marble texture"
                  defaultImgType="jpg"
                  directory="/images/textures/"
                  height="100%"
                  imgAvif
                  imgAvifDark
                  imgJpg
                  imgJpgDark
                  imgName="marble-square"
                  width="100%"
                />
              </Box>
              <Box
                bg="background.level1"
                inset={0}
                opacity={0.4}
                overflow="hidden"
                position="absolute"
                rounded="lg"
                zIndex={-1}
              />
              <Text
                color="font.secondary"
                fontSize="10px"
                fontWeight="500"
                lineHeight="12px"
                textAlign="center"
              >
                {counter.title}
              </Text>
              <Text
                color="font.primary"
                fontSize="18px"
                fontWeight="500"
                lineHeight="20px"
                fontFamily="monospace"
                letterSpacing="0.1em"
                textAlign="center"
                pl="2px"
              >
                {displayValue}
              </Text>
            </VStack>
          )
        })}
      </HStack>
    </HStack>
  )
}
