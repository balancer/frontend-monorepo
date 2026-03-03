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
  NativeSelect,
  Stack,
  Avatar,
  Card,
  Checkbox,
  Radio,
  RadioGroup,
  Link,
  Image,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tag,
  Alert,
  Field,
  List } from '@chakra-ui/react';

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
        <List.Root as='ul'>
          <List.Item>
            <a href="#colors">Colors</a>
          </List.Item>
          <List.Item>
            <a href="#typography">Typography</a>
          </List.Item>
          <List.Item>
            <a href="#buttons">Buttons</a>
          </List.Item>
          <List.Item>
            <a href="#radius">Radius</a>
          </List.Item>
          <List.Item>
            <a href="#elevation">Elevation</a>
          </List.Item>
          <List.Item>
            <a href="#shadows">Shadows</a>
          </List.Item>
          <List.Item>
            <a href="#alerts">Alerts</a>
          </List.Item>
          <List.Item>
            <a href="#cards">Cards</a>
          </List.Item>

          <List.Item>
            <a href="#forms">Form fields</a>
          </List.Item>
        </List.Root>
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
                bg: darken('blue.50', 10) }}
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
                bg: darken('blue.100', 10) }}
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
                bg: darken('blue.200', 10) }}
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
                bg: darken('blue.300', 10) }}
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
                bg: darken('blue.400', 10) }}
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
                bg: darken('blue.500', 10) }}
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
                bg: darken('blue.600', 10) }}
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
                bg: darken('blue.700', 10) }}
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
                bg: darken('blue.800', 10) }}
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
                bg: darken('blue.900', 10) }}
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
                bg: darken('gray.50', 10) }}
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
                bg: darken('gray.100', 10) }}
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
                bg: darken('gray.200', 10) }}
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
                bg: darken('gray.300', 10) }}
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
                bg: darken('gray.400', 10) }}
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
                bg: darken('gray.500', 10) }}
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
                bg: darken('gray.600', 10) }}
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
                bg: darken('gray.700', 10) }}
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
                bg: darken('gray.800', 10) }}
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
                bg: darken('gray.900', 10) }}
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
                bg: darken('orange.50', 10) }}
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
                bg: darken('orange.100', 10) }}
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
                bg: darken('orange.200', 10) }}
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
                bg: darken('orange.300', 10) }}
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
                bg: darken('orange.400', 10) }}
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
                bg: darken('orange.500', 10) }}
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
                bg: darken('orange.600', 10) }}
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
                bg: darken('orange.700', 10) }}
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
                bg: darken('orange.800', 10) }}
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
                bg: darken('orange.900', 10) }}
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

          <Stack direction="column" mb="8" gap="8">
            <Center bg="background.special" h="16" w="100%">
              Background special
            </Center>
          </Stack>
          <Stack direction="column" mb="8" gap="8">
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
          <Tag.Root colorPalette="red" my="2">
            To do
          </Tag.Root>
          <List.Root as='ul'>
            <List.Item>
              <a href="#colors">Colors</a>
            </List.Item>
            <List.Item>
              <a href="#typography">Typography</a>
            </List.Item>
            <List.Item>
              <a href="#buttons">Buttons</a>
            </List.Item>
            <List.Item>
              <a href="#cards">Cards</a>
            </List.Item>
            <List.Item>
              <a href="#inputs">Inputs</a>
            </List.Item>
          </List.Root>
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
            <Button variant='plain'>Link button</Button>
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
        <List.Root as='ul' mb="4">
          <List.Item>
            Background color is determined by height.
            <List.Root as='ul'>
              <List.Item>The higher it is, the lighter the color.</List.Item>
            </List.Root>
          </List.Item>
          <List.Item>
            Shadows are relative.
            <List.Root as='ul'>
              <List.Item>
                The shadow size is dependent on the relative distance between it and the next level.
              </List.Item>
            </List.Root>
          </List.Item>
        </List.Root>
        <Heading size="h4">Card colors</Heading>
        <Section variant="subsection">
          <Card.Root variant="level0">
            <Card.Body>
              <Text>Card level 0</Text>
              <Card.Root variant="level1">
                <Card.Body>
                  <Text>Card level 1</Text>
                  <Card.Root variant="level2">
                    <Card.Body>
                      <Text>Card level 2</Text>
                      <Card.Root variant="level3">
                        <Card.Body>
                          <Text>Card level 3</Text>
                          <Card.Root variant="level4">
                            <Card.Body>
                              <Text>Card level 4</Text>
                            </Card.Body>
                          </Card.Root>
                        </Card.Body>
                      </Card.Root>
                    </Card.Body>
                  </Card.Root>
                </Card.Body>
              </Card.Root>
            </Card.Body>
          </Card.Root>
        </Section>
      </Section>
      <Section id="shadows">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Shadows
        </Heading>
        <Stack direction="row" flexWrap="wrap" mb="8">
          <Card.Root shadow="xs" variant="level5">
            <Card.Body>
              <Text>xs</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="sm" variant="level5">
            <Card.Body>
              <Text>sm</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="base" variant="level5">
            <Card.Body>
              <Text>base</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="md" variant="level5">
            <Card.Body>
              <Text>md</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="lg" variant="level5">
            <Card.Body>
              <Text>lg</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="xl" variant="level5">
            <Card.Body>
              <Text>xl</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="2xl" variant="level5">
            <Card.Body>
              <Text>2xl</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="dark-lg" variant="level5">
            <Card.Body>
              <Text>dark-lg</Text>
            </Card.Body>
          </Card.Root>
        </Stack>
        <Stack direction="row" flexWrap="wrap">
          <Card.Root shadow="outline" variant="level5">
            <Card.Body>
              <Text>outline</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="innerBase" variant="level5">
            <Card.Body>
              <Text>inner base</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="inner" variant="level5">
            <Card.Body>
              <Text>inner</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="innerSm" variant="level5">
            <Card.Body>
              <Text>innerSm</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="innerMd" variant="level5">
            <Card.Body>
              <Text>innerMd</Text>
            </Card.Body>
          </Card.Root>
          <Card.Root shadow="innerLg" variant="level5">
            <Card.Body>
              <Text>innerLg</Text>
            </Card.Body>
          </Card.Root>
        </Stack>
      </Section>
      <Section id="alerts">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Alerts
        </Heading>
        <Section variant="subsection">
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Your browser is outdated!</Alert.Title>
            <Alert.Description>Your Chakra experience may be degraded.</Alert.Description>
          </Alert.Root>
        </Section>

        <Section variant="subsection">
          <Alert.Root status="success">
            <Alert.Indicator />
            <Alert.Title>Your browser is outdated!</Alert.Title>
            <Alert.Description>Your Chakra experience may be degraded.</Alert.Description>
          </Alert.Root>
        </Section>
        <Section variant="subsection">
          <Alert.Root status="warning">
            <Alert.Indicator />
            <Alert.Title>Your browser is outdated!</Alert.Title>
            <Alert.Description>Your Chakra experience may be degraded.</Alert.Description>
          </Alert.Root>
        </Section>

        <Section variant="subsection">
          <Alert.Root status="info">
            <Alert.Indicator />
            <Alert.Title>Your browser is outdated!</Alert.Title>
            <Alert.Description>A tip or piece of information.</Alert.Description>
          </Alert.Root>
        </Section>
      </Section>
      <Section id="cards">
        <Heading as="h1" size="h1-hero" variant="gradient-dusk">
          Cards
        </Heading>
        <Card.Root maxW="md">
          <Card.Header>
            <Flex>
              <Flex alignItems="center" flex="1" flexWrap="wrap" gap="4">
                <Avatar.Root><Avatar.Fallback /><Avatar.Root><Avatar.Fallback name="Avatar name" /></Avatar.Root><Avatar.Root><Avatar.Fallback /><Avatar.Image src="https://placehold.co/80" /></Avatar.Root></Avatar.Root>

                <Box>
                  <Heading size="sm">Title</Heading>
                  <Text>Subtitle</Text>
                </Box>
              </Flex>
            </Flex>
          </Card.Header>
          <Card.Body>
            <Text>
              lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora quidem ipsa magnam
              dignissimos impedit odit tempore, necessitatibus provident cupiditate. Explicabo iusto
              incidunt illum molestiae, dolores quam odit cupiditate id quibusdam!
            </Text>
          </Card.Body>
          <Image alt="Chakra UI" objectFit="cover" src="https://placehold.co/400x200" />

          <Card.Footer
            flexWrap="wrap"
            justify="space-between"
            css={{
              '& & > button': {
                minW: '136px' }
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
          </Card.Footer>
        </Card.Root>
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
              <Field.Root>
                <Field.Label>Input label</Field.Label>
                <InputGroup>
                  <Input
                    _focus={{
                      bg: 'input.bgFocus',
                      borderColor: 'input.borderFocus' }}
                    _focusVisible={{
                      bg: 'input.bgFocus',
                      borderColor: 'input.borderFocus',
                      shadow: 'input.innerFocus',
                      color: 'input.fontFocus' }}
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
                <Field.HelperText color="input.fontHint" fontWeight="medium">
                  Hint text that is displayed on focus of the input
                </Field.HelperText>
              </Field.Root>
            </Box>
          </Section>
          <Section variant="subsection">
            <Field.Root invalid>
              <Field.Label>Input label</Field.Label>
              <Input
                _focusVisible={{
                  shadow: 'input.innerError', // Working
                  bg: 'input.bgFocus' }}
                _hover={{ bg: 'input.bgHover' }}
                border="1px solid"
                // Not working
                borderColor="yellow"
                defaultValue="500.00"
                placeholder="Placeholder"
                // Not working
                shadow="input.innerError"
                type="text" />
              <Field.ErrorText color="input.fontHintError" fontWeight="medium">
                Exceeds wallet balance
              </Field.ErrorText>
            </Field.Root>
          </Section>
          <Section variant="subsection">
            <Box>
              <Field.Root disabled>
                <Field.Label>Disabled input label</Field.Label>
                <Input
                  _focus={{
                    bg: 'input.bgFocus',
                    borderColor: 'input.borderFocus' }}
                  _focusVisible={{
                    bg: 'input.bgFocus',
                    borderColor: 'input.borderFocus',
                    shadow: 'input.innerFocus' }}
                  _hover={{ bg: 'input.bgHover', borderColor: 'input.borderHover' }}
                  bg="input.bgDefault"
                  border="1px solid"
                  borderColor="input.borderDefault"
                  disabled
                  placeholder="Placeholder"
                  type="email"
                  // boxShadow="input.innerBase"
                />
              </Field.Root>
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
          <Input disabled placeholder="Placeholder text" />
        </Box>

        <Box mb="8">
          <Text mb="4" variant="eyebrow">
            Select
          </Text>
          <NativeSelect.Root>
            <NativeSelect.Field placeholder="Select option">
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>

        <Box mb="8">
          <Text mb="4" variant="eyebrow">
            Checkbox
          </Text>
          <Stack>
            <Checkbox.Root defaultChecked><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root></Checkbox.Label></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label>Checkbox</Checkbox.Label></Checkbox.Root></Checkbox.Label></Checkbox.Root>
            <Checkbox.Root disabled><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root></Checkbox.Label></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label>Checkbox</Checkbox.Label></Checkbox.Root></Checkbox.Label></Checkbox.Root>
          </Stack>
        </Box>

        <Box mb="8">
          <Text mb="4" variant="eyebrow">
            Radios
          </Text>
          <RadioGroup.Root defaultValue="1">
            <Stack>
              <RadioGroup.Item disabled value="1"><RadioGroup.ItemHiddenInput /><RadioGroup.ItemIndicator /><RadioGroup.ItemText>Checked
                                </RadioGroup.ItemText></RadioGroup.Item>
              <RadioGroup.Item value="2"><RadioGroup.ItemHiddenInput /><RadioGroup.ItemIndicator /><RadioGroup.ItemText>Unchecked</RadioGroup.ItemText></RadioGroup.Item>
              <RadioGroup.Item value="3"><RadioGroup.ItemHiddenInput /><RadioGroup.ItemIndicator /><RadioGroup.ItemText>Unchecked</RadioGroup.ItemText></RadioGroup.Item>
            </Stack>
          </RadioGroup.Root>
        </Box>

        <Box mb="8">
          <Text mb="4" variant="eyebrow">
            Slider
          </Text>
          <Slider.Root aria-label="slider-ex-1" defaultValue='30'>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider.Root>
        </Box>
      </Section>
    </Box>
  );
}
