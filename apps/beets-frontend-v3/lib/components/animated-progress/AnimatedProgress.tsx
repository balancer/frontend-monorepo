import { Progress, ProgressProps } from '@chakra-ui/react'

interface AnimatedProgressProps extends ProgressProps {
  value: number
}

export default function AnimatedProgress({ value, ...props }: AnimatedProgressProps) {
  return <Progress value={value} {...props} />
}
