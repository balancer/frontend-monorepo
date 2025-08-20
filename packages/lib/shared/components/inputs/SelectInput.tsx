'use client'

import { getSelectStyles } from '@repo/lib/shared/services/chakra/custom/chakra-react-select'
import {
  Select,
  OptionBase,
  GroupBase,
  SingleValue,
  DropdownIndicatorProps,
  SingleValueProps,
} from 'chakra-react-select'
import { ComponentType, ReactNode, useEffect, useState } from 'react'

export interface SelectOption extends OptionBase {
  label: ReactNode
  value: any
}

type Props = {
  id: string
  value: string
  onChange(value: string): void
  options: SelectOption[]
  defaultValue?: string
  DropdownIndicator?: ComponentType<
    DropdownIndicatorProps<SelectOption, false, GroupBase<SelectOption>>
  >
  isSearchable?: boolean
  SingleValue?: ComponentType<SingleValueProps<SelectOption, false, GroupBase<SelectOption>>>
}

export function SelectInput({
  id,
  value,
  onChange,
  options,
  defaultValue,
  DropdownIndicator,
  isSearchable = true,
  SingleValue,
}: Props) {
  const defaultOption = defaultValue
    ? options.find(option => option.value === defaultValue)
    : undefined
  const [optionValue, setOptionValue] = useState<SelectOption | undefined>(defaultOption)

  const chakraStyles = getSelectStyles<SelectOption>()

  const components = {
    ...(DropdownIndicator && { DropdownIndicator }),
    ...(SingleValue && { SingleValue }),
  }

  function handleChange(newOption: SingleValue<SelectOption>) {
    if (newOption) onChange(newOption.value)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setOptionValue(options.find(option => option.value === value)), [value])

  return (
    <Select<SelectOption, false, GroupBase<SelectOption>>
      chakraStyles={chakraStyles}
      components={components}
      id={id}
      isSearchable={isSearchable}
      menuPortalTarget={document.body}
      name="Chain"
      onChange={handleChange}
      options={options}
      styles={{
        menuPortal: base => ({ ...base, zIndex: 9999 }),
      }}
      value={optionValue}
    />
  )
}
