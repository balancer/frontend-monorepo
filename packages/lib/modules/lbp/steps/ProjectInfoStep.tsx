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
import { validateUrlFormat, validateImageUrl } from '@repo/lib/shared/utils/urls'
import { isValidTelegramHandle, isValidTwitterHandle } from '@repo/lib/shared/utils/strings'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { TextareaWithError } from '@repo/lib/shared/components/inputs/TextareaWithError'
import NextLink from 'next/link'
import { isAddress } from 'viem'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { normalizeHandle } from '@repo/lib/shared/utils/links'
import { useWatch, useFormState } from 'react-hook-form'

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
    projectInfoForm: { control },
  } = useLbpForm()
  const { errors } = useFormState({ control })
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
        render={({ field }) => (
          <InputWithError
            error={errors.name?.message}
            id="project-name"
            isDisabled={isDisabled}
            isInvalid={!!errors.name}
            maxLength={maxLength}
            onChange={e => field.onChange(e.target.value)}
            value={field.value}
          />
        )}
        rules={{
          required: 'Project name is required',
        }}
      />
    </VStack>
  )
}

function DescriptionInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control },
  } = useLbpForm()
  const { errors } = useFormState({ control })

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
        render={({ field }) => (
          <TextareaWithError
            error={errors.description?.message}
            id="project-description"
            isDisabled={isDisabled}
            isInvalid={!!errors.description}
            maxLength={maxLength}
            onChange={e => field.onChange(e.target.value)}
            placeholder="A brief description of your project and what the token will be used for."
            rows={4}
            value={field.value}
          />
        )}
        rules={{
          required: 'Project description is required',
        }}
      />
    </VStack>
  )
}

function TokenIconInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control, setValue },
  } = useLbpForm()

  const { errors } = useFormState({ control })

  const paste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue('tokenIconUrl', clipboardText, { shouldDirty: true })
  }

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="token-icon-url">
        Token icon URL
      </Text>
      <Controller
        control={control}
        name="tokenIconUrl"
        render={({ field }) => (
          <InputWithError
            error={errors.tokenIconUrl?.message}
            id="token-icon-url"
            isDisabled={isDisabled}
            isInvalid={!!errors.tokenIconUrl}
            onChange={e => field.onChange(e.target.value)}
            pasteFn={isDisabled ? undefined : paste}
            placeholder="https://project-name.com/token.svg"
            value={field.value}
          />
        )}
        rules={{
          required: 'Token icon URL is required',
          validate: validateImageUrl,
        }}
      />
    </VStack>
  )
}

function ProjectWebsiteUrlInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control },
  } = useLbpForm()
  const { errors } = useFormState({ control })

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="project-website-url">
        Project website URL
      </Text>
      <Controller
        control={control}
        name="websiteUrl"
        render={({ field }) => (
          <InputWithError
            error={errors.websiteUrl?.message}
            id="project-website-url"
            isDisabled={isDisabled}
            isInvalid={!!errors.websiteUrl}
            onChange={e => field.onChange(e.target.value)}
            placeholder="https://project-name.com"
            value={field.value}
          />
        )}
        rules={{
          required: 'Website URL is required',
          validate: validateUrlFormat,
        }}
      />
    </VStack>
  )
}

function ProjectXHandle({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control },
  } = useLbpForm()
  const { errors } = useFormState({ control })

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="x-handle">
        X / Twitter username (optional)
      </Text>
      <Controller
        control={control}
        name="xHandle"
        render={({ field }) => (
          <InputWithError
            error={errors.xHandle?.message}
            id="x-handle"
            isDisabled={isDisabled}
            isInvalid={!!errors.xHandle}
            onChange={e => field.onChange(e.target.value)}
            placeholder="@project-handle"
            value={field.value}
          />
        )}
        rules={{
          validate: (value: string | undefined) =>
            isValidTwitterHandle(normalizeHandle(value || '')),
        }}
      />
    </VStack>
  )
}

function ProjectTelegramHandle({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control },
  } = useLbpForm()
  const { errors } = useFormState({ control })

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="telegram-handle">
        Telegram username (optional)
      </Text>
      <Controller
        control={control}
        name="telegramHandle"
        render={({ field }) => (
          <InputWithError
            error={errors.telegramHandle?.message}
            id="telegram-handle"
            isDisabled={isDisabled}
            isInvalid={!!errors.telegramHandle}
            onChange={e => field.onChange(e.target.value)}
            placeholder="@project-handle"
            value={field.value}
          />
        )}
        rules={{
          validate: (value: string | undefined) =>
            isValidTelegramHandle(normalizeHandle(value || '')),
        }}
      />
    </VStack>
  )
}

function ProjectDiscordUrlInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control },
  } = useLbpForm()
  const { errors } = useFormState({ control })

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="discord-url">
        Discord community URL (optional)
      </Text>
      <Controller
        control={control}
        name="discordUrl"
        render={({ field }) => (
          <InputWithError
            error={errors.discordUrl?.message}
            id="discord-url"
            isDisabled={isDisabled}
            isInvalid={!!errors.discordUrl}
            onChange={e => field.onChange(e.target.value)}
            placeholder="https://yourdomain.com"
            value={field.value}
          />
        )}
        rules={{
          validate: validateUrlFormat,
        }}
      />
    </VStack>
  )
}

function ProjectOwnerInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control, setValue, trigger },
  } = useLbpForm()
  const { errors } = useFormState({ control })

  const { userAddress } = useUserAccount()

  const paste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue('owner', clipboardText)
    trigger('owner')
  }

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="project-owner">
        Project owner wallet address (optional)
      </Text>
      <Controller
        control={control}
        name="owner"
        render={({ field }) => (
          <InputWithError
            error={errors.owner?.message}
            id="project-owner"
            isDisabled={isDisabled}
            isInvalid={!!errors.owner}
            onChange={e => field.onChange(e.target.value)}
            pasteFn={isDisabled ? undefined : paste}
            placeholder={userAddress}
            value={field.value}
          />
        )}
        rules={{
          validate: (value: string) => !value || isAddress(value) || 'Invalid address',
        }}
      />
    </VStack>
  )
}

function PoolCreatorInput({ isDisabled }: { isDisabled: boolean }) {
  const {
    projectInfoForm: { control, setValue, trigger },
  } = useLbpForm()
  const { errors } = useFormState({ control })

  const { userAddress } = useUserAccount()

  const paste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue('poolCreator', clipboardText)
    trigger('poolCreator')
  }

  return (
    <VStack align="start" w="full">
      <Text as="label" color="font.primary" htmlFor="pool-creator">
        Pool creator wallet address (optional)
      </Text>
      <Controller
        control={control}
        name="poolCreator"
        render={({ field }) => (
          <InputWithError
            error={errors.poolCreator?.message}
            id="pool-creator"
            isDisabled={isDisabled}
            isInvalid={!!errors.poolCreator}
            onChange={e => field.onChange(e.target.value)}
            pasteFn={isDisabled ? undefined : paste}
            placeholder={userAddress}
            value={field.value}
          />
        )}
        rules={{
          validate: (value: string) => !value || isAddress(value) || 'Invalid address',
        }}
      />
    </VStack>
  )
}

function Disclaimer() {
  const {
    projectInfoForm: { control },
  } = useLbpForm()
  const { errors } = useFormState({ control })

  return (
    <FormControl isInvalid={!!errors.disclaimerAccepted}>
      <Controller
        control={control}
        name="disclaimerAccepted"
        render={({ field }) => (
          <Checkbox
            color="font.primary"
            fontWeight="medium"
            isChecked={field.value}
            onChange={field.onChange}
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
        )}
        rules={{ required: 'Conditions must be accepted' }}
      />
      <FormErrorMessage>{errors.disclaimerAccepted?.message}</FormErrorMessage>
    </FormControl>
  )
}
