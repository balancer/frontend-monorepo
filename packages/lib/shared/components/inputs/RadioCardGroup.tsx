import { Box, SimpleGrid, type BoxProps, type SimpleGridProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

export type RadioCardStyleProps = {
  containerProps?: BoxProps
  wrapperProps?: BoxProps
}

export type RadioCardProps = RadioCardStyleProps & {
  value: string
  checked?: boolean
  onChange?: (value: string) => void
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

export function RadioCard({
  children,
  containerProps,
  wrapperProps,
  value,
  checked,
  onChange,
}: RadioCardProps) {
  return (
    <Box {...defaultWrapperProps} {...wrapperProps} asChild>
      <label>
        <input
          checked={checked}
          onChange={() => onChange?.(value)}
          style={{ display: 'none' }}
          type="radio"
          value={value}
        />
        <Box {...defaultContainerProps} {...containerProps} data-checked={checked || undefined}>
          {children}
        </Box>
      </label>
    </Box>
  )
}

export type RadioCardOption<T extends string> = {
  value: T
  label: ReactNode
  cardProps?: RadioCardStyleProps
}

export type RadioCardGroupProps<T extends string> = {
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
  gap: 'md',
  w: 'full',
}

export function RadioCardGroup<T extends string>({
  name: _name,
  options,
  value,
  onChange,
  layoutProps,
  renderOption,
  radioCardProps,
}: RadioCardGroupProps<T>) {
  const mergedLayoutProps = { ...defaultLayoutProps, ...layoutProps }

  return (
    <SimpleGrid {...mergedLayoutProps}>
      {options.map(option => {
        const mergedCardProps: RadioCardStyleProps = {
          ...radioCardProps,
          ...option.cardProps,
        }

        return (
          <RadioCard
            checked={value === option.value}
            key={option.value}
            onChange={v => onChange?.(v as T)}
            value={option.value}
            {...mergedCardProps}
          >
            {renderOption ? renderOption(option) : option.label}
          </RadioCard>
        )
      })}
    </SimpleGrid>
  )
}
