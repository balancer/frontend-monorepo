import { useLocalStorage } from 'usehooks-ts'
import { useForm, UseFormProps, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form'
import { useEffect } from 'react'

/**
 * Combines react-hook-form with useLocalStorage to persist form data.
 *
 * @param storageKey The unique key for storing this form's data in local storage.
 * @param initialDefaultValues The initial default values for the form. If no data is found
 * in local storage, these values will be used and also written to local storage.
 * @param formOptions Optional configuration options for react-hook-form (excluding defaultValues).
 * @returns The form methods returned by useForm.
 */
export function usePersistentForm<TFieldValues extends FieldValues = FieldValues>(
  storageKey: string,
  initialDefaultValues: TFieldValues,
  formOptions?: Omit<UseFormProps<TFieldValues>, 'defaultValues'>
): UseFormReturn<TFieldValues> {
  const [persistedValues, setPersistedValues] = useLocalStorage<TFieldValues>(
    storageKey,
    initialDefaultValues
  )

  const form = useForm<TFieldValues>({
    ...(formOptions || {}),
    defaultValues: persistedValues as DefaultValues<TFieldValues>,
  })

  const { watch } = form

  useEffect(() => {
    // On change, update the local storage
    const subscription = watch(value => setPersistedValues(value as TFieldValues))
    return () => subscription.unsubscribe()
  }, [watch, setPersistedValues])

  return form
}
