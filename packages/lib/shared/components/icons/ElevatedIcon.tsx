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
      alignItems="center"
      background={background}
      color="font.secondary"
      display="flex"
      height={sizePx}
      justifyContent="center"
      rounded="full"
      shadow="2xl"
      width={sizePx}
    >
      <Icon {...rest} />
    </Box>
  )
}
