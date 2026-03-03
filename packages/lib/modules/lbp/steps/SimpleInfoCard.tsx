import { Card, Text } from '@chakra-ui/react';

export function SimpleInfoCard({ title, info }: { title: string; info: string }) {
  return (
    <Card.Root>
      <Card.Header>
        <Text variant="secondary">{title}</Text>
      </Card.Header>
      <Card.Body>
        <Text fontWeight="bold">{info}</Text>
      </Card.Body>
    </Card.Root>
  );
}
