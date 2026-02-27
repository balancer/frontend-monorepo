import { z, ZodError } from 'zod'
import { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { isAddress } from 'viem'
import { addDays, isAfter, parseISO } from 'date-fns'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { ProjectInfoForm, SaleStructureForm, UserActions, WeightAdjustmentType } from './lbp.types'
import { isSaleStartValid } from './steps/sale-structure/helpers'
import { isGreaterThanZeroValidation } from '@repo/lib/shared/utils/numbers'
import { validateImageUrl, validateUrlFormat } from '@repo/lib/shared/utils/urls'
import { isValidTelegramHandle, isValidTwitterHandle } from '@repo/lib/shared/utils/strings'
import { normalizeHandle } from '@repo/lib/shared/utils/links'

const numberStringSchema = (requiredMessage: string) =>
  z
    .preprocess((value: unknown) => {
      if (value === undefined || value === null) return ''
      return String(value)
    }, z.string())
    .superRefine((value, ctx: z.RefinementCtx) => {
      if (!value) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: requiredMessage })
        return
      }
      const result = isGreaterThanZeroValidation(value)
      if (result !== true) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result })
      }
    })

const feeSchema = z
  .preprocess(
    (value: unknown) => {
      if (value === '' || value === undefined || value === null) return undefined
      return Number(value)
    },
    z.number({ required_error: 'Swap fee is required', invalid_type_error: 'Swap fee is required' })
  )
  .refine(value => value >= 1 && value <= 10, {
    message: 'LBP swap fees must be set at or above 1.00% and at or below 10.00%',
  })

const optionalUrlSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .superRefine((value, ctx: z.RefinementCtx) => {
    if (!value) return
    const result = validateUrlFormat(value)
    if (result !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result })
    }
  })

const optionalHandleSchema = (validateFn: (value: string) => string | true) =>
  z
    .string()
    .optional()
    .or(z.literal(''))
    .superRefine((value, ctx: z.RefinementCtx) => {
      if (!value) return
      const result = validateFn(normalizeHandle(value))
      if (result !== true) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result })
      }
    })

const saleStructureStepBaseSchema = z.object({
  selectedChain: z.nativeEnum(GqlChain),
  launchTokenAddress: z
    .string()
    .min(1, 'Token address is required')
    .refine(value => isAddress(value), { message: 'This is an invalid token address format' }),
  saleType: z.enum([GqlPoolType.LiquidityBootstrapping, GqlPoolType.FixedLbp]),
  startDateTime: z
    .string()
    .min(1, 'Start date and time is required')
    .superRefine((value, ctx: z.RefinementCtx) => {
      const result = isSaleStartValid(value)
      if (result !== true) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result })
      }
    }),
  endDateTime: z.string().min(1, 'End date and time is required'),
  collateralTokenAddress: z.string().min(1, 'Collateral token is required'),
  weightAdjustmentType: z.nativeEnum(WeightAdjustmentType).optional(),
  customStartWeight: z.number().optional(),
  customEndWeight: z.number().optional(),
  userActions: z.nativeEnum(UserActions),
  fee: feeSchema,
  launchTokenRate: z.union([z.string(), z.number()]).optional(),
  saleTokenAmount: z.union([z.string(), z.number()]),
  collateralTokenAmount: z.union([z.string(), z.number()]).optional(),
})

type SaleStructureStepValues = z.infer<typeof saleStructureStepBaseSchema>

export const saleStructureStepSchema = saleStructureStepBaseSchema.superRefine(
  (values: SaleStructureStepValues, ctx: z.RefinementCtx) => {
    if (values.startDateTime && values.endDateTime) {
      const isEndAfterStart = isAfter(
        parseISO(values.endDateTime),
        addDays(parseISO(values.startDateTime), 1)
      )
      if (!isEndAfterStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be at least 24 hours after start time',
          path: ['endDateTime'],
        })
      }
    }

    if (values.saleType === GqlPoolType.FixedLbp) {
      const launchTokenRateValidation = numberStringSchema('Token sale price is required')
      const launchTokenRateResult = launchTokenRateValidation.safeParse(values.launchTokenRate)
      if (!launchTokenRateResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: launchTokenRateResult.error.issues[0]?.message || 'Token sale price is required',
          path: ['launchTokenRate'],
        })
      }
    } else {
      const collateralTokenAmountValidation = numberStringSchema(
        'Collateral token amount is required'
      )
      const collateralTokenAmountResult = collateralTokenAmountValidation.safeParse(
        values.collateralTokenAmount
      )
      if (!collateralTokenAmountResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            collateralTokenAmountResult.error.issues[0]?.message ||
            'Collateral token amount is required',
          path: ['collateralTokenAmount'],
        })
      }

      if (values.weightAdjustmentType === WeightAdjustmentType.CUSTOM) {
        const startWeight = values.customStartWeight
        const endWeight = values.customEndWeight
        if (startWeight === undefined || startWeight < 1 || startWeight > 99) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Starting weight must be between 1 and 99',
            path: ['customStartWeight'],
          })
        }
        if (endWeight === undefined || endWeight < 1 || endWeight > 99) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Ending weight must be between 1 and 99',
            path: ['customEndWeight'],
          })
        }
      }
    }

    const saleTokenAmountValidation = numberStringSchema('Sale token amount is required')
    const saleTokenAmountResult = saleTokenAmountValidation.safeParse(values.saleTokenAmount)
    if (!saleTokenAmountResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: saleTokenAmountResult.error.issues[0]?.message || 'Sale token amount is required',
        path: ['saleTokenAmount'],
      })
    }
  }
)

export const projectInfoStepSchema: z.ZodType<ProjectInfoForm> = z.object({
  name: z.string().min(1, 'Project name is required').max(24, 'Project name is too long'),
  description: z
    .string()
    .min(1, 'Project description is required')
    .max(240, 'Project description is too long'),
  tokenIconUrl: z
    .string()
    .min(1, 'Token icon URL is required')
    .superRefine(async (value, ctx: z.RefinementCtx) => {
      const result = await validateImageUrl(value)
      if (result !== true) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result })
      }
    }),
  websiteUrl: z
    .string()
    .min(1, 'Website URL is required')
    .superRefine((value, ctx: z.RefinementCtx) => {
      const result = validateUrlFormat(value)
      if (result !== true) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result })
      }
    }),
  xHandle: optionalHandleSchema(value => isValidTwitterHandle(value)),
  telegramHandle: optionalHandleSchema(value => isValidTelegramHandle(value)),
  discordUrl: optionalUrlSchema,
  owner: z
    .string()
    .or(z.literal(''))
    .superRefine((value, ctx: z.RefinementCtx) => {
      if (!value) return
      if (!isAddress(value)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid address' })
      }
    }),
  poolCreator: z
    .string()
    .or(z.literal(''))
    .superRefine((value, ctx: z.RefinementCtx) => {
      if (!value) return
      if (!isAddress(value)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid address' })
      }
    }),
  disclaimerAccepted: z
    .boolean()
    .refine(value => value === true, { message: 'Conditions must be accepted' }),
})

export const lbpFormSchema = z.intersection(saleStructureStepSchema, projectInfoStepSchema)

function applyZodErrors<T extends FieldValues>(form: UseFormReturn<T>, error: ZodError) {
  error.issues.forEach((issue: z.ZodIssue) => {
    if (!issue.path.length) return
    const path = issue.path.map(String).join('.') as Path<T>
    form.setError(path, { type: 'manual', message: issue.message })
  })
}

export async function validateSaleStructureStep(
  form: UseFormReturn<SaleStructureForm>
): Promise<boolean> {
  const formValid = await form.trigger(undefined, { shouldFocus: true })
  const values = form.getValues()
  const saleTokenAmountValidation = isGreaterThanZeroValidation(
    values.saleTokenAmount ? String(values.saleTokenAmount) : undefined
  )
  if (saleTokenAmountValidation !== true && !form.getFieldState('saleTokenAmount').error) {
    form.setError(
      'saleTokenAmount',
      { type: 'manual', message: saleTokenAmountValidation },
      { shouldFocus: true }
    )
  }
  if (values.saleType === GqlPoolType.FixedLbp) {
    const launchTokenRateValidation = isGreaterThanZeroValidation(
      values.launchTokenRate ? String(values.launchTokenRate) : undefined
    )
    if (launchTokenRateValidation !== true && !form.getFieldState('launchTokenRate').error) {
      form.setError(
        'launchTokenRate',
        { type: 'manual', message: launchTokenRateValidation },
        { shouldFocus: true }
      )
    }
  }
  const result = await saleStructureStepSchema.safeParseAsync(values)
  if (!result.success) {
    applyZodErrors(form, result.error)
  }
  return formValid && result.success
}

export async function validateProjectInfoStep(
  form: UseFormReturn<ProjectInfoForm>
): Promise<boolean> {
  const formValid = await form.trigger(undefined, { shouldFocus: true })
  const values = form.getValues()
  const result = await projectInfoStepSchema.safeParseAsync(values)
  if (!result.success) {
    applyZodErrors(form, result.error)
  }
  return formValid && result.success
}
