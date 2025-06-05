import { Element, heap, peek, pop, push, size } from './heap'

describe('Heap get size', () => {
  it('should return 0 on an empty heap', () => {
    const h = emptyHeap()

    expect(size(h)).toBe(0)
  })

  it('should return the number of elements on the heap', () => {
    const h = emptyHeap()
    push(h, 5)

    expect(size(h)).toBe(1)
  })
})

describe('Heap peek top element', () => {
  it('should return undefined on an empty heap', () => {
    const h = emptyHeap()

    const peekedElement = peek(h)

    expect(peekedElement).toBe(undefined)
  })

  it('should return the first element of the heap', () => {
    const h = emptyHeap()
    push(h, 5)

    const peekedElement = peek(h)

    expect(peekedElement).toBe(5)
  })

  it('should not remove that element from the heap', () => {
    const h = emptyHeap()
    push(h, 5)

    peek(h)

    expect(size(h)).toBe(1)
  })
})

describe('Adding elements to heap', () => {
  it('should resize heap as more elements are added', () => {
    const h = heap(1, (a: Element<number>) => a || 0)

    push(h, 1)
    push(h, 2)

    expect(size(h)).toBe(2)
  })

  it('should place the bigger element on top as they are added', () => {
    const h = emptyHeap()

    push(h, 5)
    expect(peek(h)).toBe(5)

    push(h, 1)
    expect(peek(h)).toBe(5)

    push(h, 10)
    expect(peek(h)).toBe(10)
  })
})

describe('Removing elements from the heap', () => {
  it('should return undefined on an empty heap', () => {
    const h = emptyHeap()

    const popedElement = pop(h)

    expect(popedElement).toBe(undefined)
  })

  it('should return the biggest element of the heap', () => {
    const h = emptyHeap()
    push(h, 1)
    push(h, 5)
    push(h, 10)
    push(h, 7)

    let popedElement = pop(h)
    expect(popedElement).toBe(10)

    popedElement = pop(h)
    expect(popedElement).toBe(7)

    popedElement = pop(h)
    expect(popedElement).toBe(5)

    popedElement = pop(h)
    expect(popedElement).toBe(1)
  })

  it('should remove the returned element of the heap', () => {
    const h = emptyHeap()
    push(h, 1)

    pop(h)

    expect(size(h)).toBe(0)
  })
})

function emptyHeap() {
  return heap(10, (a: Element<number>) => a || 0)
}
