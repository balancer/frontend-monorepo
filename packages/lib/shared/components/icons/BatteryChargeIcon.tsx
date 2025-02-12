import { SVGProps } from 'react'

interface Props extends SVGProps<SVGSVGElement> {
  percentage: number
}

export function BatteryChargeIcon({ percentage, ...props }: Props) {
  const colors = {
    1: '#F48975',
    2: '#FDBA74',
    3: '#25E2A4',
    4: '#25E2A4',
  }

  function getCount() {
    if (percentage >= 90) {
      return 4
    }
    if (percentage >= 75) {
      return 3
    }
    if (percentage >= 50) {
      return 2
    }
    return 1
  }

  const count = getCount()

  return (
    <svg
      color={colors[count]}
      fill="none"
      height="28"
      viewBox="0 0 28 28"
      width="28"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_620_3003)">
        <path
          d="M7.0013 8.16406H19.8346C20.4535 8.16406 21.047 8.4099 21.4845 8.84748C21.9221 9.28506 22.168 9.87856 22.168 10.4974V11.0807C22.168 11.2354 22.2294 11.3838 22.3388 11.4932C22.4482 11.6026 22.5966 11.6641 22.7513 11.6641C22.906 11.6641 23.0544 11.7255 23.1638 11.8349C23.2732 11.9443 23.3346 12.0927 23.3346 12.2474V15.7474C23.3346 15.9021 23.2732 16.0505 23.1638 16.1599C23.0544 16.2693 22.906 16.3307 22.7513 16.3307C22.5966 16.3307 22.4482 16.3922 22.3388 16.5016C22.2294 16.611 22.168 16.7594 22.168 16.9141V17.4974C22.168 18.1162 21.9221 18.7097 21.4845 19.1473C21.047 19.5849 20.4535 19.8307 19.8346 19.8307H7.0013C6.38246 19.8307 5.78897 19.5849 5.35139 19.1473C4.9138 18.7097 4.66797 18.1162 4.66797 17.4974V10.4974C4.66797 9.87856 4.9138 9.28506 5.35139 8.84748C5.78897 8.4099 6.38246 8.16406 7.0013 8.16406Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />

        {count > 0 && (
          <path
            d="M8.16797 11.6641V16.3307"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        )}

        {count > 1 && (
          <path
            d="M11.668 11.6641V16.3307"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        )}

        {count > 2 && (
          <path
            d="M15.168 11.6641V16.3307"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        )}

        {count > 3 && (
          <path
            d="M18.668 11.6641V16.3307"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        )}
      </g>
      <defs>
        <clipPath id="clip0_620_3003">
          <rect fill="white" height="28" rx="14" width="28" />
        </clipPath>
      </defs>
    </svg>
  )
}
