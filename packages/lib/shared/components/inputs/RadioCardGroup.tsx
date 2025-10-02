import {
  Box,
  SimpleGrid,
  type BoxProps,
  type SimpleGridProps,
  type UseRadioGroupProps,
  type UseRadioProps,
  useRadio,
  useRadioGroup,
} from '@chakra-ui/react'
import { ReactNode } from 'react'

export type RadioCardStyleProps = {
  containerProps?: BoxProps
  wrapperProps?: BoxProps
}

export type RadioCardProps = UseRadioProps &
  RadioCardStyleProps & {
    children: ReactNode
  }

const defaultWrapperProps: BoxProps = {
  w: 'full',
}

const defaultContainerProps: BoxProps = {
  borderRadius: 'lg',
  borderWidth: '1px',
  boxShadow: 'md',
  cursor: 'pointer',
  px: 5,
  py: 3,
  transition: 'all 0.2s ease',
  w: 'full',
}

export function RadioCard({ children, containerProps, wrapperProps, ...props }: RadioCardProps) {
  const { getInputProps, getRadioProps } = useRadio(props)

  const inputProps = getInputProps()
  const radioProps = getRadioProps()

  return (
    <Box as="label" {...defaultWrapperProps} {...wrapperProps}>
      <input {...inputProps} />
      <Box {...radioProps} {...defaultContainerProps} {...containerProps}>
        {children}
      </Box>
    </Box>
  )
}

export type RadioCardOption<T extends string> = {
  value: T
  label: ReactNode
  cardProps?: RadioCardStyleProps
}

export type RadioCardGroupProps<T extends string> = Omit<
  UseRadioGroupProps,
  'name' | 'value' | 'defaultValue' | 'onChange'
> & {
  name: string
  options: RadioCardOption<T>[]
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
  layoutProps?: SimpleGridProps
  renderOption?: (option: RadioCardOption<T>) => ReactNode
  radioCardProps?: RadioCardStyleProps
}

const defaultLayoutProps: SimpleGridProps = {
  columns: { base: 1, sm: 2 },
  spacing: 'md',
  w: 'full',
}

export function RadioCardGroup<T extends string>({
  name,
  options,
  value,
  defaultValue,
  onChange,
  layoutProps,
  renderOption,
  radioCardProps,
  ...groupProps
}: RadioCardGroupProps<T>) {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    value,
    defaultValue,
    onChange: selected => onChange?.(selected as T),
    ...groupProps,
  })

  const rootProps = getRootProps()
  const mergedLayoutProps = { ...defaultLayoutProps, ...layoutProps }

  return (
    <SimpleGrid {...mergedLayoutProps} {...rootProps}>
      {options.map(option => {
        const radio = getRadioProps({ value: option.value })
        const mergedCardProps: RadioCardStyleProps = {
          ...radioCardProps,
          ...option.cardProps,
        }

        return (
          <RadioCard key={option.value} {...radio} {...mergedCardProps}>
            {renderOption ? renderOption(option) : option.label}
          </RadioCard>
        )
      })}
    </SimpleGrid>
  )
}
