export function formatTextListAsItems(items: string[]): string {
  return items.reduce((acc: string, item: string) => acc + (acc ? '\n' : '') + '- ' + item, '')
}
