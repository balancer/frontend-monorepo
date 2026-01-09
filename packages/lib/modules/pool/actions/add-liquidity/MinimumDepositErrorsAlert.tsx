import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { MinimumDepositErrors } from './useIsMinimumDepositMet'
import { BalAlertContent } from '@repo/lib/shared/components/alerts/BalAlertContent'
import { ListItem, Text, UnorderedList } from '@chakra-ui/react'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useFxRates } from '@repo/lib/shared/hooks/FxRatesProvider'
import { symbolForCurrency } from '@repo/lib/shared/utils/currencies'

type Props = {
  errors: MinimumDepositErrors
}

export function MinimumDepositErrorsAlert({ errors }: Props) {
  return (
    <BalAlert
      content={
        <BalAlertContent title="Minimum deposit not met for the pool">
          <UnorderedList w="full">
            {Object.keys(errors).map(key => (
              <MinimumDepositErrorAlert errorType={key} key={key} min={errors[key]} />
            ))}
          </UnorderedList>
        </BalAlertContent>
      }
      status="error"
    />
  )
}

function MinimumDepositErrorAlert({ errorType, min }: { errorType: string; min: BigNumber }) {
  const { currency } = useUserSettings()
  const { hasFxRates } = useFxRates()

  const toCurrencyWithoutLimit = (min: BigNumber) => {
    const symbol = hasFxRates ? symbolForCurrency(currency) : '$'
    return `${symbol}${min.toFixed()}`
  }

  return (
    <ListItem color="black" pb="xxs">
      <Text color="black" fontSize="sm">
        {errorType === 'BPT'
          ? `The minimum amount to add should be ${toCurrencyWithoutLimit(min)}`
          : errorType === 'PriceImpact'
            ? `To calculate the price impact a minimum add of ${toCurrencyWithoutLimit(min)} is needed`
            : `The minimum add for ${errorType} should be at least ${min.toFixed()}`}
      </Text>
    </ListItem>
  )
}
