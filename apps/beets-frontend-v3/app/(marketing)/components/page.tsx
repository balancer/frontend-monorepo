'use client'

import {
  Text,
  Center,
  Heading,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  UnorderedList,
  ListItem,
  Stack,
  Avatar,
  Card,
  Checkbox,
  Radio,
  RadioGroup,
  CardHeader,
  CardBody,
  Link,
  CardFooter,
  Image,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tag,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react'

import { darken } from '@chakra-ui/theme-tools'
import Section from '@repo/lib/shared/components/layout/Section'

export default function Components() {
  return (
    <Box maxW="maxContent" mt="xl" mx="auto" p="mx">
      <Box as="section" mb="24">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Components
        </Heading>
        <Heading as="h2" size="h4">
          Contents
        </Heading>
        <UnorderedList>
          <ListItem>
            <a href="#colors">Colors</a>
          </ListItem>
          <ListItem>
            <a href="#typography">Typography</a>
          </ListItem>
          <ListItem>
            <a href="#buttons">Buttons</a>
          </ListItem>
          <ListItem>
            <a href="#radius">Radius</a>
          </ListItem>
          <ListItem>
            <a href="#elevation">Elevation</a>
          </ListItem>
          <ListItem>
            <a href="#shadows">Shadows</a>
          </ListItem>
          <ListItem>
            <a href="#alerts">Alerts</a>
          </ListItem>
          <ListItem>
            <a href="#cards">Cards</a>
          </ListItem>

          <ListItem>
            <a href="#forms">Form fields</a>
          </ListItem>
        </UnorderedList>
      </Box>

      <Section fontWeight="bold" id="colors">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Colors
        </Heading>

        <Section variant="subsection">
          <Heading size="h4">Primary</Heading>
          <Stack direction="row">
            <Center
              _hover={{
                bg: darken('blue.50', 10),
              }}
              bg="blue.50"
              color="black"
              fontSize="xs"
              h="16"
              w="100%"
            >
              50
            </Center>

            <Center
              _hover={{
                bg: darken('blue.100', 10),
              }}
              bg="blue.100"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              100
            </Center>

            <Center
              _hover={{
                bg: darken('blue.200', 10),
              }}
              bg="blue.200"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              200
            </Center>

            <Center
              _hover={{
                bg: darken('blue.300', 10),
              }}
              bg="blue.300"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              300
            </Center>

            <Center
              _hover={{
                bg: darken('blue.400', 10),
              }}
              bg="blue.400"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              400
            </Center>

            <Center
              _hover={{
                bg: darken('blue.500', 10),
              }}
              bg="blue.500"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              500
            </Center>

            <Center
              _hover={{
                bg: darken('blue.600', 10),
              }}
              bg="blue.600"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              600
            </Center>

            <Center
              _hover={{
                bg: darken('blue.700', 10),
              }}
              bg="blue.700"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              700
            </Center>
            <Center
              _hover={{
                bg: darken('blue.800', 10),
              }}
              bg="blue.800"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              800
            </Center>
            <Center
              _hover={{
                bg: darken('blue.900', 10),
              }}
              bg="blue.900"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              900
            </Center>
          </Stack>
        </Section>

        <Section variant="subsection">
          <Heading size="h4">Gray</Heading>
          <Stack direction="row">
            <Center
              _hover={{
                bg: darken('gray.50', 10),
              }}
              bg="gray.50"
              color="black"
              fontSize="xs"
              h="16"
              w="100%"
            >
              50
            </Center>

            <Center
              _hover={{
                bg: darken('gray.100', 10),
              }}
              bg="gray.100"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              100
            </Center>

            <Center
              _hover={{
                bg: darken('gray.200', 10),
              }}
              bg="gray.200"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              200
            </Center>

            <Center
              _hover={{
                bg: darken('gray.300', 10),
              }}
              bg="gray.300"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              300
            </Center>

            <Center
              _hover={{
                bg: darken('gray.400', 10),
              }}
              bg="gray.400"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              400
            </Center>

            <Center
              _hover={{
                bg: darken('gray.500', 10),
              }}
              bg="gray.500"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              500
            </Center>

            <Center
              _hover={{
                bg: darken('gray.600', 10),
              }}
              bg="gray.600"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              600
            </Center>

            <Center
              _hover={{
                bg: darken('gray.700', 10),
              }}
              bg="gray.700"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              700
            </Center>
            <Center
              _hover={{
                bg: darken('gray.800', 10),
              }}
              bg="gray.800"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              800
            </Center>
            <Center
              _hover={{
                bg: darken('gray.900', 10),
              }}
              bg="gray.900"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              900
            </Center>
          </Stack>
        </Section>

        <Section variant="subsection">
          <Heading size="h4">Brown</Heading>
          <Stack direction="row">
            <Center bg="brown.50" color="black" fontSize="xs" h="16" w="100%">
              50
            </Center>
            <Center bg="brown.100" color="black" fontSize="xs" h="16" w="100%">
              100
            </Center>
            <Center bg="brown.200" color="black" fontSize="xs" h="16" w="100%">
              200
            </Center>
            <Center bg="brown.300" color="black" fontSize="xs" h="16" w="100%">
              300
            </Center>
            <Center bg="brown.400" color="black" fontSize="xs" h="16" w="100%">
              400
            </Center>
            <Center bg="brown.500" color="white" fontSize="xs" h="16" w="100%">
              500
            </Center>
            <Center bg="brown.600" color="white" fontSize="xs" h="16" w="100%">
              600
            </Center>
            <Center bg="brown.700" color="white" fontSize="xs" h="16" w="100%">
              700
            </Center>
            <Center bg="brown.800" color="white" fontSize="xs" h="16" w="100%">
              800
            </Center>
            <Center bg="brown.900" color="white" fontSize="xs" h="16" w="100%">
              900
            </Center>
          </Stack>
        </Section>

        <Section variant="subsection">
          <Heading size="h4">Orange</Heading>
          <Stack direction="row">
            <Center
              _hover={{
                bg: darken('orange.50', 10),
              }}
              bg="orange.50"
              color="black"
              fontSize="xs"
              h="16"
              w="100%"
            >
              50
            </Center>

            <Center
              _hover={{
                bg: darken('orange.100', 10),
              }}
              bg="orange.100"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              100
            </Center>

            <Center
              _hover={{
                bg: darken('orange.200', 10),
              }}
              bg="orange.200"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              200
            </Center>

            <Center
              _hover={{
                bg: darken('orange.300', 10),
              }}
              bg="orange.300"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              300
            </Center>

            <Center
              _hover={{
                bg: darken('orange.400', 10),
              }}
              bg="orange.400"
              color="font.dark"
              fontSize="xs"
              h="16"
              w="100%"
            >
              400
            </Center>

            <Center
              _hover={{
                bg: darken('orange.500', 10),
              }}
              bg="orange.500"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              500
            </Center>

            <Center
              _hover={{
                bg: darken('orange.600', 10),
              }}
              bg="orange.600"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              600
            </Center>

            <Center
              _hover={{
                bg: darken('orange.700', 10),
              }}
              bg="orange.700"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              700
            </Center>
            <Center
              _hover={{
                bg: darken('orange.800', 10),
              }}
              bg="orange.800"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              800
            </Center>
            <Center
              _hover={{
                bg: darken('orange.900', 10),
              }}
              bg="orange.900"
              color="font.light"
              fontSize="xs"
              h="16"
              w="100%"
            >
              900
            </Center>
          </Stack>
        </Section>

        <Section variant="subsection">
          <Heading size="h4">Red</Heading>
          <Stack direction="row">
            <Center bg="red.50" color="black" fontSize="xs" h="16" w="100%">
              50
            </Center>
            <Center bg="red.100" color="black" fontSize="xs" h="16" w="100%">
              100
            </Center>
            <Center bg="red.200" color="black" fontSize="xs" h="16" w="100%">
              200
            </Center>
            <Center bg="red.300" color="black" fontSize="xs" h="16" w="100%">
              300
            </Center>
            <Center bg="red.400" color="black" fontSize="xs" h="16" w="100%">
              400
            </Center>
            <Center bg="red.500" color="white" fontSize="xs" h="16" w="100%">
              500
            </Center>
            <Center bg="red.600" color="white" fontSize="xs" h="16" w="100%">
              600
            </Center>
            <Center bg="red.700" color="white" fontSize="xs" h="16" w="100%">
              700
            </Center>
            <Center bg="red.800" color="white" fontSize="xs" h="16" w="100%">
              800
            </Center>
            <Center bg="red.900" color="white" fontSize="xs" h="16" w="100%">
              900
            </Center>
          </Stack>
        </Section>
        <Section variant="subsection">
          <Heading size="h4">Purple</Heading>
          <Stack direction="row">
            <Center bg="purple.50" color="black" fontSize="xs" h="16" w="100%">
              50
            </Center>
            <Center bg="purple.100" color="black" fontSize="xs" h="16" w="100%">
              100
            </Center>
            <Center bg="purple.200" color="black" fontSize="xs" h="16" w="100%">
              200
            </Center>
            <Center bg="purple.300" color="black" fontSize="xs" h="16" w="100%">
              300
            </Center>
            <Center bg="purple.400" color="black" fontSize="xs" h="16" w="100%">
              400
            </Center>
            <Center bg="purple.500" color="white" fontSize="xs" h="16" w="100%">
              500
            </Center>
            <Center bg="purple.600" color="white" fontSize="xs" h="16" w="100%">
              600
            </Center>
            <Center bg="purple.700" color="white" fontSize="xs" h="16" w="100%">
              700
            </Center>
            <Center bg="purple.800" color="white" fontSize="xs" h="16" w="100%">
              800
            </Center>
            <Center bg="purple.900" color="white" fontSize="xs" h="16" w="100%">
              900
            </Center>
          </Stack>
        </Section>
        <Section variant="subsection">
          <Heading size="h4">Green</Heading>
          <Stack direction="row">
            <Center bg="green.50" color="black" fontSize="xs" h="16" w="100%">
              50
            </Center>
            <Center bg="green.100" color="black" fontSize="xs" h="16" w="100%">
              100
            </Center>
            <Center bg="green.200" color="black" fontSize="xs" h="16" w="100%">
              200
            </Center>
            <Center bg="green.300" color="black" fontSize="xs" h="16" w="100%">
              300
            </Center>
            <Center bg="green.400" color="black" fontSize="xs" h="16" w="100%">
              400
            </Center>
            <Center bg="green.500" color="white" fontSize="xs" h="16" shadow="xl" w="100%">
              500
            </Center>
            <Center bg="green.600" color="white" fontSize="xs" h="16" w="100%">
              600
            </Center>
            <Center bg="green.700" color="white" fontSize="xs" h="16" w="100%">
              700
            </Center>
            <Center bg="green.800" color="white" fontSize="xs" h="16" w="100%">
              800
            </Center>
            <Center bg="green.900" color="white" fontSize="xs" h="16" w="100%">
              900
            </Center>
          </Stack>
        </Section>
        <Section variant="subsection">
          <Heading size="h3">Gradients</Heading>

          <Stack direction="column" mb="8" spacing="8">
            <Center bg="background.special" h="16" w="100%">
              Background special
            </Center>
          </Stack>
          <Stack direction="column" mb="8" spacing="8">
            <Center bg="background.specialSecondary" h="16" w="100%">
              Background special secondary
            </Center>
          </Stack>
        </Section>
      </Section>

      <Section id="typography">
        <Heading as="h1" size="h1-hero" variant="special">
          Typography
        </Heading>

        <Box mb="8">
          <Text variant="eyebrow">H1 Hero</Text>
          <Heading as="h1" size="h1" variant="specialSecondary ">
            Hero heading 1
          </Heading>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow">H1</Text>
          <Heading as="h1" size="h1">
            Default app Heading 1
          </Heading>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow">H2</Text>
          <Heading as="h2" size="h2" variant="h2">
            Heading 2
          </Heading>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow">H3</Text>
          <Heading as="h3" size="h3" variant="h3">
            Heading 3
          </Heading>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow">H4</Text>
          <Heading as="h4" size="h4">
            Heading 4
          </Heading>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow">H5</Text>
          <Heading as="h5" size="h5" variant="h5">
            Heading 5
          </Heading>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow">H6</Text>
          <Heading as="h6" size="h6" variant="h6">
            Heading 6
          </Heading>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow">P</Text>
          <Text maxW="container.md">
            Body text lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora quidem ipsa
            magnam dignissimos impedit odit tempore, necessitatibus provident cupiditate. Explicabo
            iusto incidunt illum molestiae, dolores quam odit cupiditate id quibusdam!
          </Text>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">Text secondary</Text>
          <Text maxW="container.md" variant="secondary">
            Body text lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora quidem ipsa
            magnam dignissimos impedit odit tempore, necessitatibus provident cupiditate. Explicabo
            iusto incidunt illum molestiae, dolores quam odit cupiditate id quibusdam!
          </Text>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">Text error</Text>
          <Text maxW="container.md" variant="secondary">
            Body text lorem ipsum dolor sit amet consectetur adipisicing elit.
          </Text>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">Text special</Text>
          <Text maxW="container.md" variant="special">
            Body text lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora quidem ipsa
            magnam dignissimos impedit odit tempore, necessitatibus provident cupiditate. Explicabo
            iusto incidunt illum molestiae, dolores quam odit cupiditate id quibusdam!
          </Text>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">Text special secondary</Text>
          <Text maxW="container.md" variant="specialSecondary">
            Body text lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora quidem ipsa
            magnam dignissimos impedit odit tempore, necessitatibus provident cupiditate. Explicabo
            iusto incidunt illum molestiae, dolores quam odit cupiditate id quibusdam!
          </Text>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">Unordered list items</Text>
          <Tag colorScheme="red" my="2">
            To do
          </Tag>
          <UnorderedList>
            <ListItem>
              <a href="#colors">Colors</a>
            </ListItem>
            <ListItem>
              <a href="#typography">Typography</a>
            </ListItem>
            <ListItem>
              <a href="#buttons">Buttons</a>
            </ListItem>
            <ListItem>
              <a href="#cards">Cards</a>
            </ListItem>
            <ListItem>
              <a href="#inputs">Inputs</a>
            </ListItem>
          </UnorderedList>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">Link</Text>
          <Box>
            <Link backgroundClip="text" bg="font.link" href="/cookies-policy">
              Cookies policy
            </Link>
          </Box>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">External link</Text>
          <Box>
            <a href="https://aura.finance/">Learn more on Aura</a>
          </Box>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">Eyebrow</Text>
          <Text variant="eyebrow">Lorem ipsum</Text>
        </Box>
      </Section>

      <Section id="buttons">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Buttons
        </Heading>
        <Section variant="subsection">
          <Heading as="h2" size="h4">
            Button sizes
          </Heading>
          <Flex align="center" gap="4" wrap="wrap">
            <Button size="xs">xs button</Button>
            <Button size="sm">sm button</Button>
            <Button size="md">md button (default)</Button>
            <Button size="lg">lg button</Button>
          </Flex>
        </Section>
        <Section variant="subsection">
          <Heading as="h2" size="h4">
            Button variants
          </Heading>
          <Flex align="center" gap="4" wrap="wrap">
            <Button variant="solid">Solid button (default)</Button>
            <Button variant="outline">Outline button</Button>
            <Button variant="ghost">Ghost button</Button>
            <Button variant="link">Link button</Button>
          </Flex>
        </Section>
        <Section variant="subsection">
          <Heading as="h2" size="h4">
            Custom{' '}
          </Heading>
          <Flex align="center" gap="3" wrap="wrap">
            <Button minW="160px" variant="primary">
              Primary
            </Button>
            <Button minW="160px" variant="secondary">
              Secondary
            </Button>
            <Button minW="160px" variant="tertiary">
              Tertiary
            </Button>
          </Flex>
        </Section>
      </Section>

      <Section id="radius">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Border Radius
        </Heading>
        <Stack direction="row" flexWrap="wrap" mb="8">
          <Center bg="background.level3" borderRadius="none" h="20" shadow="xl" w="20">
            none
          </Center>
          <Center bg="background.level3" borderRadius="sm" h="20" shadow="xl" w="20">
            <Box>
              <Center>sm</Center>
              <Center fontSize="xs">2px</Center>
            </Box>
          </Center>
          <Center bg="background.level3" borderRadius="base" h="20" shadow="xl" w="20">
            <Box>
              <Center>base</Center>
              <Center fontSize="xs">4px</Center>
            </Box>
          </Center>
          <Center bg="background.level3" borderRadius="lg" h="20" shadow="xl" w="20">
            <Box>
              <Center>lg</Center>
              <Center fontSize="xs">8px</Center>
            </Box>
          </Center>
          <Center bg="background.level3" borderRadius="xl" h="20" shadow="xl" w="20">
            <Box>
              <Center>xl</Center>
              <Center fontSize="xs">12px</Center>
            </Box>
          </Center>
          <Center bg="background.level3" borderRadius="2xl" h="20" shadow="xl" w="20">
            <Box>
              <Center>2xl</Center>
              <Center fontSize="xs">16px</Center>
            </Box>
          </Center>
          <Center bg="background.level3" borderRadius="3xl" h="20" shadow="xl" w="20">
            <Box>
              <Center>3xl</Center>
              <Center fontSize="xs">20px</Center>
            </Box>
          </Center>
          <Center bg="background.level3" borderRadius="full" h="20" shadow="xl" w="20">
            <Box>
              <Center>full</Center>
              <Center fontSize="xs">9999px</Center>
            </Box>
          </Center>
        </Stack>
      </Section>

      <Section id="elevation">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Elevation
        </Heading>
        <Text mb="4">8 level elevation system</Text>
        <UnorderedList mb="4">
          <ListItem>
            Background color is determined by height.
            <UnorderedList>
              <ListItem>The higher it is, the lighter the color.</ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            Shadows are relative.
            <UnorderedList>
              <ListItem>
                The shadow size is dependent on the relative distance between it and the next level.
              </ListItem>
            </UnorderedList>
          </ListItem>
        </UnorderedList>
        <Heading size="h4">Card colors</Heading>
        <Section variant="subsection">
          <Card variant="level0">
            <CardBody>
              <Text>Card level 0</Text>
              <Card variant="level1">
                <CardBody>
                  <Text>Card level 1</Text>
                  <Card variant="level2">
                    <CardBody>
                      <Text>Card level 2</Text>
                      <Card variant="level3">
                        <CardBody>
                          <Text>Card level 3</Text>
                          <Card variant="level4">
                            <CardBody>
                              <Text>Card level 4</Text>
                            </CardBody>
                          </Card>
                        </CardBody>
                      </Card>
                    </CardBody>
                  </Card>
                </CardBody>
              </Card>
            </CardBody>
          </Card>
        </Section>
      </Section>

      <Section id="shadows">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Shadows
        </Heading>
        <Stack direction="row" flexWrap="wrap" mb="8">
          <Card shadow="xs" variant="level5">
            <CardBody>
              <Text>xs</Text>
            </CardBody>
          </Card>
          <Card shadow="sm" variant="level5">
            <CardBody>
              <Text>sm</Text>
            </CardBody>
          </Card>
          <Card shadow="base" variant="level5">
            <CardBody>
              <Text>base</Text>
            </CardBody>
          </Card>
          <Card shadow="md" variant="level5">
            <CardBody>
              <Text>md</Text>
            </CardBody>
          </Card>
          <Card shadow="lg" variant="level5">
            <CardBody>
              <Text>lg</Text>
            </CardBody>
          </Card>
          <Card shadow="xl" variant="level5">
            <CardBody>
              <Text>xl</Text>
            </CardBody>
          </Card>
          <Card shadow="2xl" variant="level5">
            <CardBody>
              <Text>2xl</Text>
            </CardBody>
          </Card>
          <Card shadow="dark-lg" variant="level5">
            <CardBody>
              <Text>dark-lg</Text>
            </CardBody>
          </Card>
        </Stack>
        <Stack direction="row" flexWrap="wrap">
          <Card shadow="outline" variant="level5">
            <CardBody>
              <Text>outline</Text>
            </CardBody>
          </Card>
          <Card shadow="innerBase" variant="level5">
            <CardBody>
              <Text>inner base</Text>
            </CardBody>
          </Card>
          <Card shadow="inner" variant="level5">
            <CardBody>
              <Text>inner</Text>
            </CardBody>
          </Card>
          <Card shadow="innerSm" variant="level5">
            <CardBody>
              <Text>innerSm</Text>
            </CardBody>
          </Card>
          <Card shadow="innerMd" variant="level5">
            <CardBody>
              <Text>innerMd</Text>
            </CardBody>
          </Card>
          <Card shadow="innerLg" variant="level5">
            <CardBody>
              <Text>innerLg</Text>
            </CardBody>
          </Card>
        </Stack>
      </Section>

      <Section id="alerts">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Alerts
        </Heading>
        <Section variant="subsection">
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Your browser is outdated!</AlertTitle>
            <AlertDescription>Your Chakra experience may be degraded.</AlertDescription>
          </Alert>
        </Section>

        <Section variant="subsection">
          <Alert status="success">
            <AlertIcon />
            <AlertTitle>Your browser is outdated!</AlertTitle>
            <AlertDescription>Your Chakra experience may be degraded.</AlertDescription>
          </Alert>
        </Section>
        <Section variant="subsection">
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>Your browser is outdated!</AlertTitle>
            <AlertDescription>Your Chakra experience may be degraded.</AlertDescription>
          </Alert>
        </Section>

        <Section variant="subsection">
          <Alert status="info">
            <AlertIcon />
            <AlertTitle>Your browser is outdated!</AlertTitle>
            <AlertDescription>A tip or piece of information.</AlertDescription>
          </Alert>
        </Section>
      </Section>

      <Section id="cards">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Cards
        </Heading>
        <Card maxW="md">
          <CardHeader>
            <Flex>
              <Flex alignItems="center" flex="1" flexWrap="wrap" gap="4">
                <Avatar name="Avatar name" src="https://placehold.co/80" />

                <Box>
                  <Heading size="sm">Title</Heading>
                  <Text>Subtitle</Text>
                </Box>
              </Flex>
            </Flex>
          </CardHeader>
          <CardBody>
            <Text>
              lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora quidem ipsa magnam
              dignissimos impedit odit tempore, necessitatibus provident cupiditate. Explicabo iusto
              incidunt illum molestiae, dolores quam odit cupiditate id quibusdam!
            </Text>
          </CardBody>
          <Image alt="Chakra UI" objectFit="cover" src="https://placehold.co/400x200" />

          <CardFooter
            flexWrap="wrap"
            justify="space-between"
            sx={{
              '& > button': {
                minW: '136px',
              },
            }}
          >
            <Button flex="1" variant="ghost">
              Like
            </Button>
            <Button flex="1" variant="ghost">
              Comment
            </Button>
            <Button flex="1" variant="ghost">
              Share
            </Button>
          </CardFooter>
        </Card>
      </Section>

      <Section id="forms" maxW="375px">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Form fields
        </Heading>

        <Box mb="8">
          <Heading as="h3" size="h3" variant="gradient-dusk">
            Custom input fields
          </Heading>
          <Text>
            For some reason, I haven&apos;t been able to get some of these styles into the theme, so
            I&apos;ve listed all the code below
          </Text>
        </Box>

        <Section maxW="sm">
          <Section variant="subsection">
            <Box>
              <FormControl>
                <FormLabel>Input label</FormLabel>
                <InputGroup>
                  <Input
                    _focus={{
                      bg: 'input.bgFocus',
                      borderColor: 'input.borderFocus',
                    }}
                    _focusVisible={{
                      bg: 'input.bgFocus',
                      borderColor: 'input.borderFocus',
                      shadow: 'input.innerFocus',
                      color: 'input.fontFocus',
                    }}
                    _hover={{ bg: 'input.bgHover', borderColor: 'input.borderHover' }}
                    bg="input.bgDefault"
                    border="1px solid"
                    borderColor="input.borderDefault"
                    placeholder="Placeholder"
                    type="text"
                  />
                  <InputRightElement>
                    {/* <IoCloseCircle color="input.clearIcon" />  */}
                    {/* This doesn't work, but color="yellow" does work... */}
                  </InputRightElement>
                </InputGroup>
                <FormHelperText color="input.fontHint" fontWeight="medium">
                  Hint text that is displayed on focus of the input
                </FormHelperText>
              </FormControl>
            </Box>
          </Section>
          <Section variant="subsection">
            <FormControl isInvalid>
              <FormLabel>Input label</FormLabel>
              <Input
                _focusVisible={{
                  shadow: 'input.innerError', // Working
                  bg: 'input.bgFocus',
                }}
                _hover={{ bg: 'input.bgHover' }}
                border="1px solid"
                borderColor="yellow" // Not working
                defaultValue="500.00"
                errorBorderColor="red.400" // This works but I'd like to set it to 'inner.borderError' to also get the dark mode style
                placeholder="Placeholder"
                shadow="input.innerError" // Not working
                type="text"
              />
              <FormErrorMessage color="input.fontHintError" fontWeight="medium">
                Exceeds wallet balance
              </FormErrorMessage>
            </FormControl>
          </Section>
          <Section variant="subsection">
            <Box>
              <FormControl isDisabled>
                <FormLabel>Disabled input label</FormLabel>
                <Input
                  _focus={{
                    bg: 'input.bgFocus',
                    borderColor: 'input.borderFocus',
                  }}
                  _focusVisible={{
                    bg: 'input.bgFocus',
                    borderColor: 'input.borderFocus',
                    shadow: 'input.innerFocus',
                  }}
                  _hover={{ bg: 'input.bgHover', borderColor: 'input.borderHover' }}
                  bg="input.bgDefault"
                  border="1px solid"
                  borderColor="input.borderDefault"
                  isDisabled
                  placeholder="Placeholder"
                  type="email"
                  // boxShadow="input.innerBase"
                />
              </FormControl>
            </Box>
          </Section>
        </Section>

        <Box mb="8">
          <Heading as="h3" size="h3" variant="gradient-dusk">
            Theme inputs
          </Heading>
          <Text>This is how it comes out of the theme.</Text>
        </Box>

        <Box mb="8">
          <Text mb="4" variant="eyebrow">
            Input
          </Text>
          <Input placeholder="Placeholder text" />
        </Box>

        <Box mb="8">
          <Text mb="4" variant="eyebrow">
            Disabled input
          </Text>
          <Input isDisabled placeholder="Placeholder text" />
        </Box>

        <Box mb="8">
          <Text mb="4" variant="eyebrow">
            Select
          </Text>
          <Select placeholder="Select option">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
        </Box>

        <Box mb="8">
          <Text mb="4" variant="eyebrow">
            Checkbox
          </Text>
          <Stack>
            <Checkbox defaultChecked>Checkbox</Checkbox>
            <Checkbox isDisabled>Checkbox</Checkbox>
          </Stack>
        </Box>

        <Box mb="8">
          <Text mb="4" variant="eyebrow">
            Radios
          </Text>
          <RadioGroup defaultValue="1">
            <Stack>
              <Radio isDisabled value="1">
                Checked
              </Radio>
              <Radio value="2">Unchecked</Radio>
              <Radio value="3">Unchecked</Radio>
            </Stack>
          </RadioGroup>
        </Box>

        <Box mb="8">
          <Text mb="4" variant="eyebrow">
            Slider
          </Text>
          <Slider aria-label="slider-ex-1" defaultValue={30}>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
      </Section>
    </Box>
  )
}
