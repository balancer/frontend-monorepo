import {
  Heading,
  VStack,
  Text,
  HStack,
  Spacer,
  Divider,
  Checkbox,
  Button,
  InputGroup,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react'
import { useLbpForm } from '../LbpFormProvider'
import { ProjectInfoForm } from '../lbp.types'
import { Controller, SubmitHandler } from 'react-hook-form'
import { LbpFormAction } from '../LbpFormAction'
import { isValidUrl } from '@repo/lib/shared/utils/urls'
import { isValidTelegramHandle, isValidTwitterHandle } from '@repo/lib/shared/utils/strings'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { TextareaWithError } from '@repo/lib/shared/components/inputs/TextareaWithError'
import NextLink from 'next/link'
import { isAddress } from 'viem'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useDebounce } from 'use-debounce'
import { defaultDebounceMs } from '@repo/lib/shared/utils/queries'
import { useCheckImageUrl } from '@repo/lib/shared/hooks/url.hooks'
import { useEffect } from 'react'

export function ProjectInfoStep() {
  const {
    projectInfoForm: {
      handleSubmit,
      formState: { isValid },
    },
    setActiveStep,
    activeStepIndex,
  } = useLbpForm()

  const onSubmit: SubmitHandler<ProjectInfoForm> = () => {
    setActiveStep(activeStepIndex + 1)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        <Heading color="font.maxContrast" size="md">
          Project info
        </Heading>

        <NameInput />
        <DescriptionInput />
        <TokenIconInput />
        <ProjectWebsiteUrlInput />
        <ProjectXHandle />
        <ProjectTelegramHandle />
        <ProjectDiscordUrlInput />
        <ProjectOwnerInput />

        <Divider />

        <Disclaimer />

        <LbpFormAction disabled={!isValid} />
      </VStack>
    </form>
  )
}

function NameInput() {
  const {
    projectInfoForm: {
      control,
      formState: { errors },
      watch,
    },
  } = useLbpForm()
  const length = watch('name').length
  const maxLength = 24

  return (
    <VStack align="start" w="full">
      <HStack w="full">
        <Text color="font.primary">Project name</Text>
        <Spacer />
        <Text color="font.secondary">{`${length}/${maxLength}`}</Text>
      </HStack>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <InputWithError
            error={errors.name?.message}
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

function DescriptionInput() {
  const {
    projectInfoForm: {
      control,
      formState: { errors },
      watch,
    },
  } = useLbpForm()

  const length = watch('description').length
  const maxLength = 240

  return (
    <VStack align="start" w="full">
      <HStack w="full">
        <Text color="font.primary">Project description</Text>
        <Spacer />
        <Text color="font.secondary">{`${length}/${maxLength}`}</Text>
      </HStack>
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextareaWithError
            error={errors.description?.message}
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

function TokenIconInput() {
  const {
    projectInfoForm: {
      control,
      formState: { errors, dirtyFields },
      watch,
      trigger,
    },
  } = useLbpForm()

  const [iconUrl] = useDebounce(watch('tokenIconUrl'), defaultDebounceMs)
  const { isChecking, error } = useCheckImageUrl(iconUrl, ['image/png', 'image/jpeg'])
  useEffect(() => {
    if (dirtyFields.tokenIconUrl) trigger('tokenIconUrl')
  }, [iconUrl, isChecking, error, trigger, dirtyFields])

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Token icon URL</Text>
      <Controller
        control={control}
        name="tokenIconUrl"
        render={({ field }) => (
          <InputGroup>
            <InputWithError
              error={isChecking ? '' : errors.tokenIconUrl?.message}
              isInvalid={!isChecking && !!errors.tokenIconUrl}
              onChange={e => field.onChange(e.target.value)}
              placeholder="https://yourdomain.com/token-icon.png"
              value={field.value}
            />
            {isChecking && (
              <InputRightElement>
                <Spinner />
              </InputRightElement>
            )}
          </InputGroup>
        )}
        rules={{
          required: 'Token icon URL is required',
          validate: () => (isChecking ? 'Checking' : error ? error : true),
        }}
      />
    </VStack>
  )
}

function ProjectWebsiteUrlInput() {
  const {
    projectInfoForm: {
      control,
      formState: { errors },
    },
  } = useLbpForm()

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Project website URL</Text>
      <Controller
        control={control}
        name="websiteUrl"
        render={({ field }) => (
          <InputWithError
            error={errors.websiteUrl?.message}
            isInvalid={!!errors.websiteUrl}
            onChange={e => field.onChange(e.target.value)}
            placeholder="https://yourdomain.com"
            value={field.value}
          />
        )}
        rules={{
          required: 'Website URL is required',
          validate: isValidUrl,
        }}
      />
    </VStack>
  )
}

function ProjectXHandle() {
  const {
    projectInfoForm: {
      control,
      formState: { errors },
    },
  } = useLbpForm()

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">X / Twitter handle (optional)</Text>
      <Controller
        control={control}
        name="xHandle"
        render={({ field }) => (
          <InputWithError
            error={errors.xHandle?.message}
            isInvalid={!!errors.xHandle}
            onChange={e => field.onChange(e.target.value)}
            placeholder="@yourhandle"
            value={field.value}
          />
        )}
        rules={{
          validate: isValidTwitterHandle,
        }}
      />
    </VStack>
  )
}

function ProjectTelegramHandle() {
  const {
    projectInfoForm: {
      control,
      formState: { errors },
    },
  } = useLbpForm()

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Telegram handle (optional)</Text>
      <Controller
        control={control}
        name="telegramHandle"
        render={({ field }) => (
          <InputWithError
            error={errors.telegramHandle?.message}
            isInvalid={!!errors.telegramHandle}
            onChange={e => field.onChange(e.target.value)}
            placeholder="@yourhandle"
            value={field.value}
          />
        )}
        rules={{
          validate: isValidTelegramHandle,
        }}
      />
    </VStack>
  )
}

function ProjectDiscordUrlInput() {
  const {
    projectInfoForm: {
      control,
      formState: { errors },
    },
  } = useLbpForm()

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Discord URL (optional)</Text>
      <Controller
        control={control}
        name="discordUrl"
        render={({ field }) => (
          <InputWithError
            error={errors.discordUrl?.message}
            isInvalid={!!errors.discordUrl}
            onChange={e => field.onChange(e.target.value)}
            placeholder="https://yourdomain.com"
            value={field.value}
          />
        )}
        rules={{
          validate: isValidUrl,
        }}
      />
    </VStack>
  )
}

function ProjectOwnerInput() {
  const {
    projectInfoForm: {
      control,
      formState: { errors },
    },
  } = useLbpForm()

  const { userAddress } = useUserAccount()

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Project owner (optional)</Text>
      <Controller
        control={control}
        name="owner"
        render={({ field }) => (
          <InputWithError
            error={errors.owner?.message}
            isInvalid={!!errors.owner}
            onChange={e => field.onChange(e.target.value)}
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

  return (
    <Controller
      control={control}
      name="disclaimerAccepted"
      render={({ field }) => (
        <Checkbox
          color="font.primary"
          isChecked={field.value}
          onChange={field.onChange}
          pl="md"
          size="lg"
        >
          {'I accept the'}
          <Button
            as={NextLink}
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
            href={'/terms-of-use'}
            px="0.3em"
            target="_blank"
            textColor="font.link"
            variant="link"
          >
            Terms of Use
          </Button>
          {'for creating and LBP.'}
        </Checkbox>
      )}
      rules={{ required: 'Conditions must be accepted' }}
    />
  )
}
