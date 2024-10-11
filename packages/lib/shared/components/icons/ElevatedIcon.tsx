import { Box, Icon, IconProps } from '@chakra-ui/react'

type Props = {
  sizePx: string
  as: any
}
export function ElevatedIcon({
  sizePx,
  background = 'background.level2',
  ...rest
}: Props & IconProps) {
  return (
    <Box
      rounded="full"
      width={sizePx}
      height={sizePx}
      background={background}
      shadow="2xl"
      display="flex"
      justifyContent="center"
      alignItems="center"
      color="font.secondary"
    >
      <Icon {...rest} />
    </Box>
  )
}
