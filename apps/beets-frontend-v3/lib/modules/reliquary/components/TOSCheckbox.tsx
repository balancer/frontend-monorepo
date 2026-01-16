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
      <VStack align="start" spacing="sm">
        <HStack spacing="xs">
          <Checkbox isChecked={checked} onChange={e => onChange(e.target.checked)} size="lg">
            <Text as="div" fontSize="md" lineHeight="1" sx={{ textWrap: 'pretty' }}>
              <TextShine animationDuration="1.5s">
                I agree to the terms of service as stated&nbsp;
                <Link href="https://beets.fi/terms-of-service" isExternal>
                  here
                </Link>
              </TextShine>
            </Text>
          </Checkbox>
        </HStack>
      </VStack>
    </FadeInOnView>
  )
}
