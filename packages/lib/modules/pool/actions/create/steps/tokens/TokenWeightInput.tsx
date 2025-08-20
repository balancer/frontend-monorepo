import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { Text, Box, VStack } from '@chakra-ui/react'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { Controller } from 'react-hook-form'
import { useValidatePoolConfig } from '../../useValidatePoolConfig'

export function TokenWeightInput({
  isInvalid,
  isDisabled,
  index,
}: {
  isDisabled: boolean
  isInvalid: boolean
  index: number
}) {
  const { isWeightedPool } = useValidatePoolConfig()

  const {
    poolConfigForm: { control },
  } = usePoolCreationForm()

  return (
    // Using hidden so validation runs if user starts weighted pool but goes back to switch to another pool type
    <VStack align="start" hidden={!isWeightedPool} spacing="sm">
      <Text>Weight</Text>
      <Box position="relative" w="20">
        <Controller
          control={control}
          name={`poolTokens.${index}.weight`}
          render={({ field, fieldState }) => (
            <>
              <InputWithError
                {...field}
                isDisabled={isDisabled}
                isInvalid={isInvalid || !!fieldState.error}
                placeholder="0"
              />
              <Text
                color="font.secondary"
                opacity={isDisabled ? 0.3 : 1}
                position="absolute"
                right="3"
                top="2.5"
                zIndex={1}
              >
                %
              </Text>
            </>
          )}
          rules={{
            validate: value => {
              if (!isWeightedPool) return true
              if (Number(value) < 1) return 'Minimum weight for each token is 1%'
              if (Number(value) > 100) return 'Maximum weight for a token is 99%'
              return true
            },
          }}
        />
      </Box>
    </VStack>
  )
}
