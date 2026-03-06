import { VStack, HStack, Checkbox, Text, Link } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { TextShine } from '@repo/lib/shared/components/TextShine/TextShine'

export function TOSCheckbox({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <FadeInOnView scaleUp={false}>
      <VStack align="start" gap="sm">
        <HStack gap="xs">
          <Checkbox.Root
            checked={checked}
            onCheckedChange={(e: any) => onChange(e.target.checked)}
            size="lg"
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>
              <Checkbox.Root>
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox.Root>
              <Checkbox.Root>
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>
                  <Checkbox.Root>
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox.Root>
                </Checkbox.Label>
              </Checkbox.Root>
              <Checkbox.Root>
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>
                  <Text
                    as="div"
                    css={{
                      textWrap: 'pretty',
                    }}
                    fontSize="md"
                    lineHeight="1"
                  >
                    <TextShine animationDuration="1.5s">
                      I agree to the terms of service as stated&nbsp;
                      <Link
                        href="https://beets.fi/terms-of-service"
                        onClick={e => e.stopPropagation()}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        here
                      </Link>
                    </TextShine>
                  </Text>
                </Checkbox.Label>
              </Checkbox.Root>
            </Checkbox.Label>
          </Checkbox.Root>
        </HStack>
      </VStack>
    </FadeInOnView>
  )
}
