import {
  Heading,
  VStack,
  Text,
  HStack,
  Spacer,
  Divider,
  Checkbox,
  Button,
  FormControl,
  FormErrorMessage,
} from '@chakra-ui/react'
import { useLbpForm } from '../LbpFormProvider'
import { ProjectInfoForm } from '../lbp.types'
import { Controller, SubmitHandler } from 'react-hook-form'
import { LbpFormAction } from '../LbpFormAction'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { TextareaWithError } from '@repo/lib/shared/components/inputs/TextareaWithError'
import NextLink from 'next/link'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useWatch } from 'react-hook-form'

export function ProjectInfoStep() {
  const {
    projectInfoForm: { handleSubmit },
    goToNextStep,
    isProjectInfoLocked,
  } = useLbpForm()

  const onSubmit: SubmitHandler<ProjectInfoForm> = () => {
    goToNextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        <Heading color="font.maxContrast" size="md">
          Project info
        </Heading>

        <NameInput isDisabled={isProjectInfoLocked} />
        <DescriptionInput isDisabled={isProjectInfoLocked} />
        <ProjectWebsiteUrlInput isDisabled={isProjectInfoLocked} />
        <TokenIconInput isDisabled={isProjectInfoLocked} />
        <ProjectOwnerInput isDisabled={isProjectInfoLocked} />
        <PoolCreatorInput isDisabled={isProjectInfoLocked} />
        <Divider />
        <Heading color="font.maxContrast" size="md">
          Social accounts
        </Heading>
        <ProjectXHandle isDisabled={isProjectInfoLocked} />
        <ProjectTelegramHandle isDisabled={isProjectInfoLocked} />
        <ProjectDiscordUrlInput isDisabled={isProjectInfoLocked} />

        <Divider />
        <Disclaimer />
        <LbpFormAction />
      </VStack>
    </form>
  )
}

function NameInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { clearErrors, control },
  } = useLbpForm()
  const length = useWatch({ control, name: 'name' }).length
  const maxLength = 24

  return (
    <VStack align="start" w="full">
      <HStack w="full">
        <Text as="label" color="font.primary" htmlFor="project-name">
          Project name
        </Text>
        <Spacer />
        <Text
          className="tabular-number"
          color="font.secondary"
          fontSize="sm"
        >{`${length} / ${maxLength}`}</Text>
      </HStack>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <InputWithError
            error={fieldState.error?.message}
            id="project-name"
            isDisabled={isDisabled}
            isInvalid={fieldState.invalid}
            maxLength={maxLength}
            onChange={e => {
              field.onChange(e.target.value)
              clearErrors('name')
            }}
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function DescriptionInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { clearErrors, control },
  } = useLbpForm()

  const length = useWatch({ control, name: 'description' }).length
  const maxLength = 240

  return (
    <VStack align="start" w="full">
      <HStack w="full">
        <Text as="label" color="font.primary" htmlFor="project-description">
          Project description
        </Text>
        <Spacer />
        <Text
          className="tabular-number"
          color="font.secondary"
          fontSize="sm"
        >{`${length} / ${maxLength}`}</Text>
      </HStack>
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <TextareaWithError
            error={fieldState.error?.message}
            id="project-description"
            isDisabled={isDisabled}
            isInvalid={fieldState.invalid}
            maxLength={maxLength}
            onChange={e => {
              field.onChange(e.target.value)
              clearErrors('description')
            }}
            placeholder="A brief description of your project and what the token will be used for."
            rows={4}
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function TokenIconInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { clearErrors, control, setValue },
  } = useLbpForm()

  const paste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue('tokenIconUrl', clipboardText, { shouldDirty: true })
    clearErrors('tokenIconUrl')
  }

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="token-icon-url">
        Token icon URL
      </Text>
      <Controller
        control={control}
        name="tokenIconUrl"
        render={({ field, fieldState }) => (
          <InputWithError
            error={fieldState.error?.message}
            id="token-icon-url"
            isDisabled={isDisabled}
            isInvalid={fieldState.invalid}
            onChange={e => {
              field.onChange(e.target.value)
              clearErrors('tokenIconUrl')
            }}
            pasteFn={isDisabled ? undefined : paste}
            placeholder="https://project-name.com/token.svg"
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function ProjectWebsiteUrlInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { clearErrors, control },
  } = useLbpForm()

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="project-website-url">
        Project website URL
      </Text>
      <Controller
        control={control}
        name="websiteUrl"
        render={({ field, fieldState }) => (
          <InputWithError
            error={fieldState.error?.message}
            id="project-website-url"
            isDisabled={isDisabled}
            isInvalid={fieldState.invalid}
            onChange={e => {
              field.onChange(e.target.value)
              clearErrors('websiteUrl')
            }}
            placeholder="https://project-name.com"
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function ProjectXHandle({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control },
  } = useLbpForm()

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="x-handle">
        X / Twitter username (optional)
      </Text>
      <Controller
        control={control}
        name="xHandle"
        render={({ field, fieldState }) => (
          <InputWithError
            error={fieldState.error?.message}
            id="x-handle"
            isDisabled={isDisabled}
            isInvalid={fieldState.invalid}
            onChange={e => field.onChange(e.target.value)}
            placeholder="@project-handle"
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function ProjectTelegramHandle({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control },
  } = useLbpForm()

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="telegram-handle">
        Telegram username (optional)
      </Text>
      <Controller
        control={control}
        name="telegramHandle"
        render={({ field, fieldState }) => (
          <InputWithError
            error={fieldState.error?.message}
            id="telegram-handle"
            isDisabled={isDisabled}
            isInvalid={fieldState.invalid}
            onChange={e => field.onChange(e.target.value)}
            placeholder="@project-handle"
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function ProjectDiscordUrlInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control },
  } = useLbpForm()

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="discord-url">
        Discord community URL (optional)
      </Text>
      <Controller
        control={control}
        name="discordUrl"
        render={({ field, fieldState }) => (
          <InputWithError
            error={fieldState.error?.message}
            id="discord-url"
            isDisabled={isDisabled}
            isInvalid={fieldState.invalid}
            onChange={e => field.onChange(e.target.value)}
            placeholder="https://yourdomain.com"
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function ProjectOwnerInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control, setValue },
  } = useLbpForm()

  const { userAddress } = useUserAccount()

  const paste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue('owner', clipboardText)
  }

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="project-owner">
        Project owner wallet address (optional)
      </Text>
      <Controller
        control={control}
        name="owner"
        render={({ field, fieldState }) => (
          <InputWithError
            error={fieldState.error?.message}
            id="project-owner"
            isDisabled={isDisabled}
            isInvalid={fieldState.invalid}
            onChange={e => field.onChange(e.target.value)}
            pasteFn={isDisabled ? undefined : paste}
            placeholder={userAddress}
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function PoolCreatorInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control, setValue },
  } = useLbpForm()

  const { userAddress } = useUserAccount()

  const paste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue('poolCreator', clipboardText)
  }

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="pool-creator">
        Pool creator wallet address (optional)
      </Text>
      <Controller
        control={control}
        name="poolCreator"
        render={({ field, fieldState }) => (
          <InputWithError
            error={fieldState.error?.message}
            id="pool-creator"
            isDisabled={isDisabled}
            isInvalid={fieldState.invalid}
            onChange={e => field.onChange(e.target.value)}
            pasteFn={isDisabled ? undefined : paste}
            placeholder={userAddress}
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function Disclaimer() {
  const {
    projectInfoForm: { clearErrors, control },
  } = useLbpForm()

  return (
    <FormControl>
      <Controller
        control={control}
        name="disclaimerAccepted"
        render={({ field, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid}>
            <Checkbox
              color="font.primary"
              data-testid="disclaimer-checkbox"
              fontWeight="medium"
              isChecked={field.value}
              onChange={event => {
                field.onChange(event)
                clearErrors('disclaimerAccepted')
              }}
              size="lg"
            >
              {'I accept the'}
              <Button
                as={NextLink}
                fontSize="lg"
                fontWeight="medium"
                href={'/risks'}
                px="0.3em"
                target="_blank"
                textColor="font.link"
                variant="link"
              >
                Risks
              </Button>
              {'and'}
              <Button
                as={NextLink}
                fontSize="lg"
                fontWeight="medium"
                href={'/terms-of-use'}
                px="0.3em"
                target="_blank"
                textColor="font.link"
                variant="link"
              >
                Terms of Use
              </Button>
              {'for creating and LBP'}
            </Checkbox>
            <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
          </FormControl>
        )}
      />
    </FormControl>
  )
}
