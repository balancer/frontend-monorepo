export function buildMarkline(id: string, start: Date, end: Date, height: number) {
  return {
    id,
    type: 'line',
    data: [
      [start, height],
      [end, height],
    ],
    lineStyle: {
      color: 'grey',
      type: 'dashed',
      width: 1,
      cap: 'round' as const,
      join: 'round' as const,
    },
    showSymbol: false,
  }
}
