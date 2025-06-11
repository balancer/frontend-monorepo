import { HStack, Icon, Text, VStack, Box } from '@chakra-ui/react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { useDateCountdown } from '@repo/lib/shared/hooks/date.hooks'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import { format, isAfter, isBefore, secondsToMilliseconds } from 'date-fns'
import { AlertTriangle, Clock } from 'react-feather'
import { PropsWithChildren } from 'react'
import { now } from '@repo/lib/shared/utils/time'

function TimeElement({ title, value }: { title: string; value: string }) {
  return (
    <VStack>
      <Text
        color="font.secondary"
        fontSize="10px"
        fontWeight="500"
        lineHeight="12px"
        textAlign="center"
      >
        {title}
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
        {value}
      </Text>
    </VStack>
  )
}

function Tile({ children }: PropsWithChildren) {
  return (
    <VStack
      position="relative"
      px="sm"
      rounded="lg"
      shadow="2xl"
      spacing="none"
      alignItems="center"
      justifyContent="center"
      minH="100%"
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
      {children}
    </VStack>
  )
}

export function LbpHeaderTimeInfo() {
  const { pool } = usePool()

  // this will only be rendered for LBPs so we can be sure it is a liquidity bootstrapping pool
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
  const startTimeFormatted = format(secondsToMilliseconds(lbpPool.startTime), 'haaa MM/dd/yy')
  const endTimeFormatted = format(secondsToMilliseconds(lbpPool.endTime), 'haaa MM/dd/yy')
  const currentTime = now()

  return (
    <>
      {isBefore(currentTime, secondsToMilliseconds(lbpPool.startTime)) ? (
        <HStack w="full" spacing="4">
          <HStack
            flex="1"
            h="full"
            justifyContent="start"
            alignItems="center"
            borderRadius="sm"
            borderStyle="dashed"
            borderColor="special"
            borderWidth="1px"
            backgroundColor="special"
            color="special"
            px="2"
          >
            <Icon as={Clock} fontVariant="special" />
            <Text variant="special">{`LBP starts ${startTimeFormatted}`}</Text>
          </HStack>

          <Countdown until={new Date(secondsToMilliseconds(lbpPool.startTime))} />
        </HStack>
      ) : isAfter(currentTime, secondsToMilliseconds(lbpPool.endTime)) ? (
        <HStack
          flex="1"
          h="full"
          w="full"
          justifyContent="start"
          alignItems="center"
          bg="red.400"
          borderRadius="sm"
          color="black"
          px="2"
        >
          <Icon as={AlertTriangle} />
          <Text color="black">{`LBP ended ${endTimeFormatted}`}</Text>
        </HStack>
      ) : (
        <HStack w="full" spacing="4">
          <HStack
            flex="1"
            h="full"
            justifyContent="start"
            alignItems="center"
            bg="green.400"
            borderRadius="sm"
            color="black"
            px="2"
          >
            <Icon as={Clock} />
            <Text color="black">{`LBP is live! Ends ${endTimeFormatted}`}</Text>
          </HStack>

          <Countdown until={new Date(secondsToMilliseconds(lbpPool.endTime))} />
        </HStack>
      )}
    </>
  )
}

function Countdown({ until }: { until: Date }) {
  const info = useDateCountdown(until)

  return (
    <HStack spacing="xs" h="48px" flexShrink="0">
      <Tile>
        <TimeElement title="D" value={String(info.daysDiff)} />
      </Tile>
      <Tile>
        <HStack spacing="xs">
          <TimeElement title="H" value={String(info.hoursDiff).padStart(2, '0')} />
          <TimeElement title="M" value={String(info.minutesDiff).padStart(2, '0')} />
          <TimeElement title="S" value={String(info.secondsDiff).padStart(2, '0')} />
        </HStack>
      </Tile>
    </HStack>
  )
}
