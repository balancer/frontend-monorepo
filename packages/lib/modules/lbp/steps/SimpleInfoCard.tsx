import { Card, CardBody, CardHeader, Text } from '@chakra-ui/react'

export function SimpleInfoCard({ title, info }: { title: string; info: string }) {
  return (
    <Card>
      <CardHeader>
        <Text variant="secondary">{title}</Text>
      </CardHeader>
      <CardBody>
        <Text fontWeight="bold">{info}</Text>
      </CardBody>
    </Card>
  )
}
