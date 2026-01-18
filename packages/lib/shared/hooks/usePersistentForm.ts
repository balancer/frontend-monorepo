import { useLocalStorage } from 'usehooks-ts'
import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
  DefaultValues,
  useWatch,
} from 'react-hook-form'
import { useEffect, useCallback, useState, startTransition } from 'react'

/**
 * Combines react-hook-form with useLocalStorage to persist form data.
 *
 * @param storageKey The unique key for storing this form's data in local storage.
 * @param initialDefaultValues The initial default values for the form. If no data is found
 * in local storage, these values will be used and also written to local storage.
 * @param formOptions Optional configuration options for react-hook-form (excluding defaultValues).
 * @returns The form methods returned by useForm, plus isHydrated state.
 */
export function usePersistentForm<TFieldValues extends FieldValues = FieldValues>(
  storageKey: string,
  initialDefaultValues: DefaultValues<TFieldValues>,
  formOptions?: Omit<UseFormProps<TFieldValues>, 'defaultValues'>
): UseFormReturn<TFieldValues> & { resetToInitial: () => void; isHydrated: boolean } {
  const [isHydrated, setIsHydrated] = useState(false)
  const [persistedValues, setPersistedValues] = useLocalStorage<DefaultValues<TFieldValues>>(
    storageKey,
    initialDefaultValues
  )

  const form = useForm<TFieldValues>({
    ...(formOptions || {}),
    defaultValues: initialDefaultValues,
  })

  // Set persisted values after form initialization
  useEffect(() => {
    if (persistedValues !== initialDefaultValues) {
      form.reset(persistedValues, { keepDefaultValues: true })
      form.trigger()
    }
    startTransition(() => setIsHydrated(true))
  }, [])

  const { control } = form
  const formValues = useWatch({ control })

  useEffect(() => {
    setPersistedValues(formValues as DefaultValues<TFieldValues>)
  }, [formValues, setPersistedValues])

  const resetToInitial = useCallback(() => {
    setPersistedValues(initialDefaultValues)
    form.reset(initialDefaultValues)
  }, [form, initialDefaultValues, setPersistedValues])

  return { ...form, resetToInitial, isHydrated }
}
