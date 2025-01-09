import { ColorModeScript as ChakraColorModeScript } from '@chakra-ui/react'
import { config } from './themes/base/foundations'

export function ColorModeScript() {
  return <ChakraColorModeScript initialColorMode={config.initialColorMode} />
}
