import { Icon, IconProps } from '@chakra-ui/react'

export function ExpandIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M11.2222 2.33374H15.6666V6.77818"
        stroke="currentColor"
        strokeWidth="1.11111"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.77776 15.6671H2.33331V11.2227"
        stroke="currentColor"
        strokeWidth="1.11111"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.6666 2.33374L10.4814 7.51893"
        stroke="currentColor"
        strokeWidth="1.11111"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.33331 15.6664L7.5185 10.4812"
        stroke="currentColor"
        strokeWidth="1.11111"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  )
}
