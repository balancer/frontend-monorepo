import { Heading, VStack, Text, HStack, Spacer, Checkbox, Button, Separator } from '@chakra-ui/react';
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
    projectInfoForm: { control, handleSubmit },
    goToNextStep } = useLbpForm()

  const onSubmit: SubmitHandler<ProjectInfoForm> = () => {
    goToNextStep()
  }

  const { isValid } = useFormState({ control })

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <VStack align="start" gap="lg" w="full">
        <Heading color="font.maxContrast" size="md">
          Project info
        </Heading>

        <NameInput />
        <DescriptionInput />
        <ProjectWebsiteUrlInput />
        <TokenIconInput />
        <ProjectOwnerInput />
        <PoolCreatorInput />
        <Separator />
        <Heading color="font.maxContrast" size="md">
          Social accounts
        </Heading>
        <ProjectXHandle />
        <ProjectTelegramHandle />
        <ProjectDiscordUrlInput />

        <Separator />
        <Disclaimer />
        <LbpFormAction disabled={!isValid} />
      </VStack>
    </form>
  );
}

function NameInput() {
  const {
    projectInfoForm: { control } } = useLbpForm()
  const { errors } = useFormState({ control })
  const length = useWatch({ control, name: 'name' }).length
  const maxLength = 24

  return (
    <VStack align="start" w="full">
      <HStack w="full">
        <Text color="font.primary" asChild><label htmlFor="project-name">Project name
                  </label></Text>
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
            isInvalid={!!errors.name}
            maxLength={maxLength}
            onChange={e => field.onChange(e.target.value)}
            value={field.value}
          />
        )}
        rules={{
          required: 'Project name is required' }}
      />
    </VStack>
  );
}

function DescriptionInput() {
  const {
    projectInfoForm: { control } } = useLbpForm()
  const { errors } = useFormState({ control })

  const length = useWatch({ control, name: 'description' }).length
  const maxLength = 240

  return (
    <VStack align="start" w="full">
      <HStack w="full">
        <Text color="font.primary" asChild><label htmlFor="project-description">Project description
                  </label></Text>
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
            isInvalid={!!errors.description}
            maxLength={maxLength}
            onChange={e => field.onChange(e.target.value)}
            placeholder="A brief description of your project and what the token will be used for."
            rows={4}
            value={field.value}
          />
        )}
        rules={{
          required: 'Project description is required' }}
      />
    </VStack>
  );
}

function TokenIconInput() {
  const {
    projectInfoForm: { control, setValue } } = useLbpForm()

  const { errors } = useFormState({ control })

  const paste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue('tokenIconUrl', clipboardText, { shouldDirty: true })
  }

  return (
    <VStack align="start" w="full">
      <Text color="font.primary" asChild><label htmlFor="token-icon-url">Token icon URL
              </label></Text>
      <Controller
        control={control}
        name="tokenIconUrl"
        render={({ field }) => (
          <InputWithError
            error={errors.tokenIconUrl?.message}
            id="token-icon-url"
            isInvalid={!!errors.tokenIconUrl}
            onChange={e => field.onChange(e.target.value)}
            pasteFn={paste}
            placeholder="https://project-name.com/token.svg"
            value={field.value}
          />
        )}
        rules={{
          required: 'Token icon URL is required',
          validate: validateImageUrl }}
      />
    </VStack>
  );
}

function ProjectWebsiteUrlInput() {
  const {
    projectInfoForm: { control } } = useLbpForm()
  const { errors } = useFormState({ control })

  return (
    <VStack align="start" w="full">
      <Text color="font.primary" asChild><label htmlFor="project-website-url">Project website URL
              </label></Text>
      <Controller
        control={control}
        name="websiteUrl"
        render={({ field }) => (
          <InputWithError
            error={errors.websiteUrl?.message}
            id="project-website-url"
            isInvalid={!!errors.websiteUrl}
            onChange={e => field.onChange(e.target.value)}
            placeholder="https://project-name.com"
            value={field.value}
          />
        )}
        rules={{
          required: 'Website URL is required',
          validate: validateUrlFormat }}
      />
    </VStack>
  );
}

function ProjectXHandle() {
  const {
    projectInfoForm: { control } } = useLbpForm()
  const { errors } = useFormState({ control })

  return (
    <VStack align="start" w="full">
      <Text color="font.primary" asChild><label htmlFor="x-handle">X / Twitter username (optional)
              </label></Text>
      <Controller
        control={control}
        name="xHandle"
        render={({ field }) => (
          <InputWithError
            error={errors.xHandle?.message}
            id="x-handle"
            isInvalid={!!errors.xHandle}
            onChange={e => field.onChange(e.target.value)}
            placeholder="@project-handle"
            value={field.value}
          />
        )}
        rules={{
          validate: (value: string | undefined) =>
            isValidTwitterHandle(normalizeHandle(value || '')) }}
      />
    </VStack>
  );
}

function ProjectTelegramHandle() {
  const {
    projectInfoForm: { control } } = useLbpForm()
  const { errors } = useFormState({ control })

  return (
    <VStack align="start" w="full">
      <Text color="font.primary" asChild><label htmlFor="telegram-handle">Telegram username (optional)
              </label></Text>
      <Controller
        control={control}
        name="telegramHandle"
        render={({ field }) => (
          <InputWithError
            error={errors.telegramHandle?.message}
            id="telegram-handle"
            isInvalid={!!errors.telegramHandle}
            onChange={e => field.onChange(e.target.value)}
            placeholder="@project-handle"
            value={field.value}
          />
        )}
        rules={{
          validate: (value: string | undefined) =>
            isValidTelegramHandle(normalizeHandle(value || '')) }}
      />
    </VStack>
  );
}

function ProjectDiscordUrlInput() {
  const {
    projectInfoForm: { control } } = useLbpForm()
  const { errors } = useFormState({ control })

  return (
    <VStack align="start" w="full">
      <Text color="font.primary" asChild><label htmlFor="discord-url">Discord community URL (optional)
              </label></Text>
      <Controller
        control={control}
        name="discordUrl"
        render={({ field }) => (
          <InputWithError
            error={errors.discordUrl?.message}
            id="discord-url"
            isInvalid={!!errors.discordUrl}
            onChange={e => field.onChange(e.target.value)}
            placeholder="https://yourdomain.com"
            value={field.value}
          />
        )}
        rules={{
          validate: validateUrlFormat }}
      />
    </VStack>
  );
}

function ProjectOwnerInput() {
  const {
    projectInfoForm: { control, setValue, trigger } } = useLbpForm()
  const { errors } = useFormState({ control })

  const { userAddress } = useUserAccount()

  const paste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue('owner', clipboardText)
    trigger('owner')
  }

  return (
    <VStack align="start" w="full">
      <Text color="font.primary" asChild><label htmlFor="project-owner">Project owner wallet address (optional)
              </label></Text>
      <Controller
        control={control}
        name="owner"
        render={({ field }) => (
          <InputWithError
            error={errors.owner?.message}
            id="project-owner"
            isInvalid={!!errors.owner}
            onChange={e => field.onChange(e.target.value)}
            pasteFn={paste}
            placeholder={userAddress}
            value={field.value}
          />
        )}
        rules={{
          validate: (value: string) => !value || isAddress(value) || 'Invalid address' }}
      />
    </VStack>
  );
}

function PoolCreatorInput() {
  const {
    projectInfoForm: { control, setValue, trigger } } = useLbpForm()
  const { errors } = useFormState({ control })

  const { userAddress } = useUserAccount()

  const paste = async () => {
    const clipboardText = await navigator.clipboard.readText()
    setValue('poolCreator', clipboardText)
    trigger('poolCreator')
  }

  return (
    <VStack align="start" w="full">
      <Text color="font.primary" asChild><label htmlFor="pool-creator">Pool creator wallet address (optional)
              </label></Text>
      <Controller
        control={control}
        name="poolCreator"
        render={({ field }) => (
          <InputWithError
            error={errors.poolCreator?.message}
            id="pool-creator"
            isInvalid={!!errors.poolCreator}
            onChange={e => field.onChange(e.target.value)}
            pasteFn={paste}
            placeholder={userAddress}
            value={field.value}
          />
        )}
        rules={{
          validate: (value: string) => !value || isAddress(value) || 'Invalid address' }}
      />
    </VStack>
  );
}

function Disclaimer() {
  const {
    projectInfoForm: { control } } = useLbpForm()

  return (
    <Controller
      control={control}
      name="disclaimerAccepted"
      render={({ field }) => (
        <Checkbox.Root
          color="font.primary"
          fontWeight="medium"
          onCheckedChange={field.onChange}
          size="lg"
          checked={field.value}
        ><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root></Checkbox.Label></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label>
              {'I accept the'}
              <Button
                fontSize="lg"
                fontWeight="medium"
                px="0.3em"
                textColor="font.link"
                variant='plain'
                asChild><NextLink href={'/risks'} target="_blank">Risks
                              </NextLink></Button>
              {'and'}
              <Button
                fontSize="lg"
                fontWeight="medium"
                px="0.3em"
                textColor="font.link"
                variant='plain'
                asChild><NextLink href={'/terms-of-use'} target="_blank">Terms of Use
                              </NextLink></Button>
              {'for creating and LBP'}
            </Checkbox.Label></Checkbox.Root></Checkbox.Label></Checkbox.Root>
      )}
      rules={{ required: 'Conditions must be accepted' }}
    />
  );
}
