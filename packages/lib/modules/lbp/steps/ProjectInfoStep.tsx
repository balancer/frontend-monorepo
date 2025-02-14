'use client'

import { Heading, VStack, Text, Input, Textarea } from '@chakra-ui/react'
import { useLbpForm } from '../LbpFormProvider'
import { ProjectInfoForm } from '../lbp.types'
import { Controller, SubmitHandler } from 'react-hook-form'
import { LbpFormAction } from '../LbpFormAction'
import { isValidUrl } from '@repo/lib/shared/utils/urls'

export function ProjectInfoStep() {
  const {
    projectInfoForm: { handleSubmit },
    setActiveStep,
    activeStepIndex,
  } = useLbpForm()

  const onSubmit: SubmitHandler<ProjectInfoForm> = data => {
    console.log(data)
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

        <LbpFormAction />
      </VStack>
    </form>
  )
}

function NameInput() {
  const {
    projectInfoForm: {
      control,
      formState: { errors },
    },
  } = useLbpForm()

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Project name</Text>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <>
            <Input
              isInvalid={!!errors.name}
              onChange={e => field.onChange(e.target.value)}
              value={field.value}
            />
            <Text color="font.error" fontSize="sm">
              {errors.name?.message}
            </Text>
          </>
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
    },
  } = useLbpForm()

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Project description</Text>
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <>
            <Textarea
              isInvalid={!!errors.description}
              onChange={e => field.onChange(e.target.value)}
              placeholder="A brief description of your project and what the token will be used for."
              value={field.value}
            />
            <Text color="font.error" fontSize="sm">
              {errors.description?.message}
            </Text>
          </>
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
      formState: { errors },
    },
  } = useLbpForm()

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Token icon URL</Text>
      <Controller
        control={control}
        name="tokenIconUrl"
        render={({ field }) => (
          <>
            <Input
              isInvalid={!!errors.tokenIconUrl}
              onChange={e => field.onChange(e.target.value)}
              placeholder="https://yourdomain.com/token-icon.svg"
              value={field.value}
            />
            <Text color="font.error" fontSize="sm">
              {errors.tokenIconUrl?.message}
            </Text>
          </>
        )}
        rules={{
          required: 'Token icon URL is required',
          validate: isValidUrl,
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
          <>
            <Input
              isInvalid={!!errors.websiteUrl}
              onChange={e => field.onChange(e.target.value)}
              placeholder="https://yourdomain.com"
              value={field.value}
            />
            <Text color="font.error" fontSize="sm">
              {errors.websiteUrl?.message}
            </Text>
          </>
        )}
        rules={{
          required: 'Website URL is required',
          validate: isValidUrl,
        }}
      />
    </VStack>
  )
}
