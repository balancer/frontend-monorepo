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
import Section from '@/lib/shared/components/layout/Section'

export default function Components() {
  return (
    <Box p="mx" maxW="maxContent" mx="auto" mt="xl">
      <Box as="section" mb="24">
        <Heading as="h1" variant="gradient-dusk" size="h1-hero">
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

      <Section id="colors" fontWeight="bold">
        <Heading as="h1" variant="gradient-dusk" size="h1-hero">
          Colors
        </Heading>

        <Section variant="subsection">
          <Heading size="h4">Primary</Heading>
          <Stack direction="row">
            <Center
              bg="blue.50"
              _hover={{
                bg: darken('blue.50', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'black'}
            >
              50
            </Center>

            <Center
              bg="blue.100"
              _hover={{
                bg: darken('blue.100', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              100
            </Center>

            <Center
              bg="blue.200"
              _hover={{
                bg: darken('blue.200', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              200
            </Center>

            <Center
              bg="blue.300"
              _hover={{
                bg: darken('blue.300', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              300
            </Center>

            <Center
              bg="blue.400"
              _hover={{
                bg: darken('blue.400', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              400
            </Center>

            <Center
              bg="blue.500"
              _hover={{
                bg: darken('blue.500', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              500
            </Center>

            <Center
              bg="blue.600"
              _hover={{
                bg: darken('blue.600', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              600
            </Center>

            <Center
              bg="blue.700"
              _hover={{
                bg: darken('blue.700', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              700
            </Center>
            <Center
              bg="blue.800"
              _hover={{
                bg: darken('blue.800', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              800
            </Center>
            <Center
              bg="blue.900"
              _hover={{
                bg: darken('blue.900', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              900
            </Center>
          </Stack>
        </Section>

        <Section variant="subsection">
          <Heading size="h4">Gray</Heading>
          <Stack direction="row">
            <Center
              bg="gray.50"
              _hover={{
                bg: darken('gray.50', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'black'}
            >
              50
            </Center>

            <Center
              bg="gray.100"
              _hover={{
                bg: darken('gray.100', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              100
            </Center>

            <Center
              bg="gray.200"
              _hover={{
                bg: darken('gray.200', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              200
            </Center>

            <Center
              bg="gray.300"
              _hover={{
                bg: darken('gray.300', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              300
            </Center>

            <Center
              bg="gray.400"
              _hover={{
                bg: darken('gray.400', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              400
            </Center>

            <Center
              bg="gray.500"
              _hover={{
                bg: darken('gray.500', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              500
            </Center>

            <Center
              bg="gray.600"
              _hover={{
                bg: darken('gray.600', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              600
            </Center>

            <Center
              bg="gray.700"
              _hover={{
                bg: darken('gray.700', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              700
            </Center>
            <Center
              bg="gray.800"
              _hover={{
                bg: darken('gray.800', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              800
            </Center>
            <Center
              bg="gray.900"
              _hover={{
                bg: darken('gray.900', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              900
            </Center>
          </Stack>
        </Section>

        <Section variant="subsection">
          <Heading size="h4">Brown</Heading>
          <Stack direction="row">
            <Center bg="brown.50" w="100%" h="16" fontSize="xs" color={'black'}>
              50
            </Center>
            <Center bg="brown.100" w="100%" h="16" fontSize="xs" color={'black'}>
              100
            </Center>
            <Center bg="brown.200" w="100%" h="16" fontSize="xs" color={'black'}>
              200
            </Center>
            <Center bg="brown.300" w="100%" h="16" fontSize="xs" color={'black'}>
              300
            </Center>
            <Center bg="brown.400" w="100%" h="16" fontSize="xs" color={'black'}>
              400
            </Center>
            <Center bg="brown.500" w="100%" h="16" fontSize="xs" color={'white'}>
              500
            </Center>
            <Center bg="brown.600" w="100%" h="16" fontSize="xs" color={'white'}>
              600
            </Center>
            <Center bg="brown.700" w="100%" h="16" fontSize="xs" color={'white'}>
              700
            </Center>
            <Center bg="brown.800" w="100%" h="16" fontSize="xs" color={'white'}>
              800
            </Center>
            <Center bg="brown.900" w="100%" h="16" fontSize="xs" color={'white'}>
              900
            </Center>
          </Stack>
        </Section>

        <Section variant="subsection">
          <Heading size="h4">Orange</Heading>
          <Stack direction="row">
            <Center
              bg="orange.50"
              _hover={{
                bg: darken('orange.50', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'black'}
            >
              50
            </Center>

            <Center
              bg="orange.100"
              _hover={{
                bg: darken('orange.100', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              100
            </Center>

            <Center
              bg="orange.200"
              _hover={{
                bg: darken('orange.200', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              200
            </Center>

            <Center
              bg="orange.300"
              _hover={{
                bg: darken('orange.300', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              300
            </Center>

            <Center
              bg="orange.400"
              _hover={{
                bg: darken('orange.400', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.dark'}
            >
              400
            </Center>

            <Center
              bg="orange.500"
              _hover={{
                bg: darken('orange.500', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              500
            </Center>

            <Center
              bg="orange.600"
              _hover={{
                bg: darken('orange.600', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              600
            </Center>

            <Center
              bg="orange.700"
              _hover={{
                bg: darken('orange.700', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              700
            </Center>
            <Center
              bg="orange.800"
              _hover={{
                bg: darken('orange.800', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              800
            </Center>
            <Center
              bg="orange.900"
              _hover={{
                bg: darken('orange.900', 10),
              }}
              w="100%"
              h="16"
              fontSize="xs"
              color={'font.light'}
            >
              900
            </Center>
          </Stack>
        </Section>

        <Section variant="subsection">
          <Heading size="h4">Red</Heading>
          <Stack direction="row">
            <Center bg="red.50" w="100%" h="16" fontSize="xs" color={'black'}>
              50
            </Center>
            <Center bg="red.100" w="100%" h="16" fontSize="xs" color={'black'}>
              100
            </Center>
            <Center bg="red.200" w="100%" h="16" fontSize="xs" color={'black'}>
              200
            </Center>
            <Center bg="red.300" w="100%" h="16" fontSize="xs" color={'black'}>
              300
            </Center>
            <Center bg="red.400" w="100%" h="16" fontSize="xs" color={'black'}>
              400
            </Center>
            <Center bg="red.500" w="100%" h="16" fontSize="xs" color={'white'}>
              500
            </Center>
            <Center bg="red.600" w="100%" h="16" fontSize="xs" color={'white'}>
              600
            </Center>
            <Center bg="red.700" w="100%" h="16" fontSize="xs" color={'white'}>
              700
            </Center>
            <Center bg="red.800" w="100%" h="16" fontSize="xs" color={'white'}>
              800
            </Center>
            <Center bg="red.900" w="100%" h="16" fontSize="xs" color={'white'}>
              900
            </Center>
          </Stack>
        </Section>
        <Section variant="subsection">
          <Heading size="h4">Purple</Heading>
          <Stack direction="row">
            <Center bg="purple.50" w="100%" h="16" fontSize="xs" color={'black'}>
              50
            </Center>
            <Center bg="purple.100" w="100%" h="16" fontSize="xs" color={'black'}>
              100
            </Center>
            <Center bg="purple.200" w="100%" h="16" fontSize="xs" color={'black'}>
              200
            </Center>
            <Center bg="purple.300" w="100%" h="16" fontSize="xs" color={'black'}>
              300
            </Center>
            <Center bg="purple.400" w="100%" h="16" fontSize="xs" color={'black'}>
              400
            </Center>
            <Center bg="purple.500" w="100%" h="16" fontSize="xs" color={'white'}>
              500
            </Center>
            <Center bg="purple.600" w="100%" h="16" fontSize="xs" color={'white'}>
              600
            </Center>
            <Center bg="purple.700" w="100%" h="16" fontSize="xs" color={'white'}>
              700
            </Center>
            <Center bg="purple.800" w="100%" h="16" fontSize="xs" color={'white'}>
              800
            </Center>
            <Center bg="purple.900" w="100%" h="16" fontSize="xs" color={'white'}>
              900
            </Center>
          </Stack>
        </Section>
        <Section variant="subsection">
          <Heading size="h4">Green</Heading>
          <Stack direction="row">
            <Center bg="green.50" w="100%" h="16" fontSize="xs" color={'black'}>
              50
            </Center>
            <Center bg="green.100" w="100%" h="16" fontSize="xs" color={'black'}>
              100
            </Center>
            <Center bg="green.200" w="100%" h="16" fontSize="xs" color={'black'}>
              200
            </Center>
            <Center bg="green.300" w="100%" h="16" fontSize="xs" color={'black'}>
              300
            </Center>
            <Center bg="green.400" w="100%" h="16" fontSize="xs" color={'black'}>
              400
            </Center>
            <Center bg="green.500" shadow="xl" w="100%" h="16" fontSize="xs" color={'white'}>
              500
            </Center>
            <Center bg="green.600" w="100%" h="16" fontSize="xs" color={'white'}>
              600
            </Center>
            <Center bg="green.700" w="100%" h="16" fontSize="xs" color={'white'}>
              700
            </Center>
            <Center bg="green.800" w="100%" h="16" fontSize="xs" color={'white'}>
              800
            </Center>
            <Center bg="green.900" w="100%" h="16" fontSize="xs" color={'white'}>
              900
            </Center>
          </Stack>
        </Section>
        <Section variant="subsection">
          <Heading size="h3">Gradients</Heading>

          <Stack direction="column" spacing="8" mb="8">
            <Center bg="background.special" w="100%" h="16">
              Background special
            </Center>
          </Stack>
          <Stack direction="column" spacing="8" mb="8">
            <Center bg="background.specialSecondary" w="100%" h="16">
              Background special secondary
            </Center>
          </Stack>
        </Section>
      </Section>

      <Section id="typography">
        <Heading as="h1" variant="special" size="h1-hero">
          Typography
        </Heading>

        <Box mb="8">
          <Text variant="eyebrow">H1 Hero</Text>
          <Heading as="h1" variant="specialSecondary " size="h1">
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
          <Heading variant="h2" as="h2" size="h2">
            Heading 2
          </Heading>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow">H3</Text>
          <Heading variant="h3" as="h3" size="h3">
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
          <Heading variant="h5" as="h5" size="h5">
            Heading 5
          </Heading>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow">H6</Text>
          <Heading variant="h6" as="h6" size="h6">
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
          <Text variant="secondary" maxW="container.md">
            Body text lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora quidem ipsa
            magnam dignissimos impedit odit tempore, necessitatibus provident cupiditate. Explicabo
            iusto incidunt illum molestiae, dolores quam odit cupiditate id quibusdam!
          </Text>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">Text error</Text>
          <Text variant="secondary" maxW="container.md">
            Body text lorem ipsum dolor sit amet consectetur adipisicing elit.
          </Text>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">Text special</Text>
          <Text variant="special" maxW="container.md">
            Body text lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora quidem ipsa
            magnam dignissimos impedit odit tempore, necessitatibus provident cupiditate. Explicabo
            iusto incidunt illum molestiae, dolores quam odit cupiditate id quibusdam!
          </Text>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">Text special secondary</Text>
          <Text variant="specialSecondary" maxW="container.md">
            Body text lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora quidem ipsa
            magnam dignissimos impedit odit tempore, necessitatibus provident cupiditate. Explicabo
            iusto incidunt illum molestiae, dolores quam odit cupiditate id quibusdam!
          </Text>
        </Box>
        <Box mb="8">
          <Text variant="eyebrow">Unordered list items</Text>
          <Tag my="2" colorScheme="red">
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
            <Link bg="font.link" backgroundClip="text" href="/cookies-policy">
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
        <Heading as="h1" variant="gradient-dusk" size="h1-hero">
          Buttons
        </Heading>
        <Section variant="subsection">
          <Heading size="h4" as="h2">
            Button sizes
          </Heading>
          <Flex gap="4" align={'center'} wrap="wrap">
            <Button size="xs">xs button</Button>
            <Button size="sm">sm button</Button>
            <Button size="md">md button (default)</Button>
            <Button size="lg">lg button</Button>
          </Flex>
        </Section>
        <Section variant="subsection">
          <Heading size="h4" as="h2">
            Button variants
          </Heading>
          <Flex gap="4" align={'center'} wrap="wrap">
            <Button variant="solid">Solid button (default)</Button>
            <Button variant="outline">Outline button</Button>
            <Button variant="ghost">Ghost button</Button>
            <Button variant="link">Link button</Button>
          </Flex>
        </Section>
        <Section variant="subsection">
          <Heading size="h4" as="h2">
            Custom{' '}
          </Heading>
          <Flex gap="3" align={'center'} wrap="wrap">
            <Button variant="primary" minW="160px">
              Primary
            </Button>
            <Button variant="secondary" minW="160px">
              Secondary
            </Button>
            <Button variant="tertiary" minW="160px">
              Tertiary
            </Button>
          </Flex>
        </Section>
      </Section>

      <Section id="radius">
        <Heading as="h1" variant="gradient-dusk" size="h1-hero">
          Border Radius
        </Heading>
        <Stack direction="row" flexWrap="wrap" mb="8">
          <Center h="20" w="20" borderRadius="none" bg="background.level3" shadow="xl">
            none
          </Center>
          <Center h="20" w="20" borderRadius="sm" bg="background.level3" shadow="xl">
            <Box>
              <Center>sm</Center>
              <Center fontSize="xs">2px</Center>
            </Box>
          </Center>
          <Center h="20" w="20" borderRadius="base" bg="background.level3" shadow="xl">
            <Box>
              <Center>base</Center>
              <Center fontSize="xs">4px</Center>
            </Box>
          </Center>
          <Center h="20" w="20" borderRadius="lg" bg="background.level3" shadow="xl">
            <Box>
              <Center>lg</Center>
              <Center fontSize="xs">8px</Center>
            </Box>
          </Center>
          <Center h="20" w="20" borderRadius="xl" bg="background.level3" shadow="xl">
            <Box>
              <Center>xl</Center>
              <Center fontSize="xs">12px</Center>
            </Box>
          </Center>
          <Center h="20" w="20" borderRadius="2xl" bg="background.level3" shadow="xl">
            <Box>
              <Center>2xl</Center>
              <Center fontSize="xs">16px</Center>
            </Box>
          </Center>
          <Center h="20" w="20" borderRadius="3xl" bg="background.level3" shadow="xl">
            <Box>
              <Center>3xl</Center>
              <Center fontSize="xs">20px</Center>
            </Box>
          </Center>
          <Center h="20" w="20" borderRadius="full" bg="background.level3" shadow="xl">
            <Box>
              <Center>full</Center>
              <Center fontSize="xs">9999px</Center>
            </Box>
          </Center>
        </Stack>
      </Section>

      <Section id="elevation">
        <Heading as="h1" variant="gradient-dusk" size="h1-hero">
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
        <Heading as="h1" variant="gradient-dusk" size="h1-hero">
          Shadows
        </Heading>
        <Stack direction="row" flexWrap="wrap" mb="8">
          <Card variant="level5" shadow="xs">
            <CardBody>
              <Text>xs</Text>
            </CardBody>
          </Card>
          <Card variant="level5" shadow="sm">
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
        <Heading as="h1" variant="gradient-dusk" size="h1-hero">
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
        <Heading as="h1" variant="gradient-dusk" size="h1-hero">
          Cards
        </Heading>
        <Card maxW="md">
          <CardHeader>
            <Flex>
              <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
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
          <Image objectFit="cover" src="https://placehold.co/400x200" alt="Chakra UI" />

          <CardFooter
            justify="space-between"
            flexWrap="wrap"
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
        <Heading as="h1" variant="gradient-dusk" size="h1-hero">
          Form fields
        </Heading>

        <Box mb="8">
          <Heading as="h3" variant="gradient-dusk" size="h3">
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
                    type="text"
                    placeholder="Placeholder"
                    bg="input.bgDefault"
                    border="1px solid"
                    borderColor="input.borderDefault"
                    _hover={{ bg: 'input.bgHover', borderColor: 'input.borderHover' }}
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
                  />
                  <InputRightElement>
                    {/* <IoCloseCircle color="input.clearIcon" />  */}
                    {/* This doesn't work, but color="yellow" does work... */}
                  </InputRightElement>
                </InputGroup>
                <FormHelperText fontWeight="medium" color="input.fontHint">
                  Hint text that is displayed on focus of the input
                </FormHelperText>
              </FormControl>
            </Box>
          </Section>
          <Section variant="subsection">
            <FormControl isInvalid>
              <FormLabel>Input label</FormLabel>
              <Input
                placeholder="Placeholder"
                type="text"
                defaultValue="500.00"
                border="1px solid"
                borderColor="yellow" // Not working
                shadow="input.innerError" // Not working
                errorBorderColor="red.400" // This works but I'd like to set it to 'inner.borderError' to also get the dark mode style
                _hover={{ bg: 'input.bgHover' }}
                _focusVisible={{
                  shadow: 'input.innerError', // Working
                  bg: 'input.bgFocus',
                }}
              />
              <FormErrorMessage fontWeight="medium" color="input.fontHintError">
                Exceeds wallet balance
              </FormErrorMessage>
            </FormControl>
          </Section>
          <Section variant="subsection">
            <Box>
              <FormControl isDisabled>
                <FormLabel>Disabled input label</FormLabel>
                <Input
                  type="email"
                  isDisabled
                  placeholder="Placeholder"
                  bg="input.bgDefault"
                  border="1px solid"
                  // boxShadow="input.innerBase"
                  borderColor="input.borderDefault"
                  _hover={{ bg: 'input.bgHover', borderColor: 'input.borderHover' }}
                  _focus={{
                    bg: 'input.bgFocus',
                    borderColor: 'input.borderFocus',
                  }}
                  _focusVisible={{
                    bg: 'input.bgFocus',
                    borderColor: 'input.borderFocus',
                    shadow: 'input.innerFocus',
                  }}
                />
              </FormControl>
            </Box>
          </Section>
        </Section>

        <Box mb="8">
          <Heading as="h3" variant="gradient-dusk" size="h3">
            Theme inputs
          </Heading>
          <Text>This is how it comes out of the theme.</Text>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow" mb="4">
            Input
          </Text>
          <Input placeholder="Placeholder text" />
        </Box>

        <Box mb="8">
          <Text variant="eyebrow" mb="4">
            Disabled input
          </Text>
          <Input isDisabled placeholder="Placeholder text" />
        </Box>

        <Box mb="8">
          <Text variant="eyebrow" mb="4">
            Select
          </Text>
          <Select placeholder="Select option">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow" mb="4">
            Checkbox
          </Text>
          <Stack>
            <Checkbox defaultChecked>Checkbox</Checkbox>
            <Checkbox isDisabled>Checkbox</Checkbox>
          </Stack>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow" mb="4">
            Radios
          </Text>
          <RadioGroup defaultValue="1">
            <Stack>
              <Radio value="1" isDisabled>
                Checked
              </Radio>
              <Radio value="2">Unchecked</Radio>
              <Radio value="3">Unchecked</Radio>
            </Stack>
          </RadioGroup>
        </Box>

        <Box mb="8">
          <Text variant="eyebrow" mb="4">
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
