export type Element<T> = T | undefined

export type Heap<Element> = {
  elements: Element[]
  valueOf: (a: Element) => number
}

export function heap<Element>(size: number, valueOf: (a: Element) => number): Heap<Element> {
  return {
    elements: new Array<Element>(size),
    valueOf,
  }
}

export function size<T>(h: Heap<Element<T>>) {
  return h.elements.reduce((acc, current) => {
    return current !== undefined ? acc + 1 : acc
  }, 0)
}

export function peek<T>(h: Heap<Element<T>>) {
  return h.elements[0]
}

export function push<T>(h: Heap<Element<T>>, element: Element<T>) {
  const lastIndex = size(h)
  h.elements[lastIndex] = element

  return orderUp(h, lastIndex)
}

export function pop<T>(h: Heap<Element<T>>) {
  const item = h.elements[0]
  const heapSize = size(h)
  h.elements[0] = h.elements[heapSize - 1]
  h.elements[heapSize - 1] = undefined
  orderDown(h, 0)

  return item
}

const leftChildIndex = (i: number) => 2 * i + 1

function hasLeftChild<T>(h: Heap<Element<T>>, i: number) {
  return leftChildIndex(i) < size(h)
}

function leftChild<T>(h: Heap<Element<T>>, i: number) {
  return h.elements[leftChildIndex(i)]
}

const rightChildIndex = (i: number) => 2 * i + 2

function hasRightChild<T>(h: Heap<Element<T>>, i: number) {
  return rightChildIndex(i) < size(h)
}

function rightChild<T>(h: Heap<Element<T>>, i: number) {
  return h.elements[rightChildIndex(i)]
}

const hasParent = (i: number) => i > 0

const parentIndex = (i: number) => Math.ceil((i - 2) / 2)

function parent<T>(h: Heap<Element<T>>, i: number) {
  return h.elements[parentIndex(i)]
}

function swap<T>(h: Heap<Element<T>>, i1: number, i2: number) {
  const temp = h.elements[i1]
  h.elements[i1] = h.elements[i2]
  h.elements[i2] = temp
}

function orderUp<T>(h: Heap<Element<T>>, i: number) {
  if (hasParent(i) && h.valueOf(parent(h, i)) < h.valueOf(h.elements[i])) {
    swap(h, parentIndex(i), i)
    return orderUp(h, parentIndex(i))
  } else {
    return h
  }
}

function orderDown<T>(h: Heap<Element<T>>, i: number) {
  if (hasLeftChild(h, i)) {
    const biggerChildIndex =
      hasRightChild(h, i) && h.valueOf(rightChild(h, i)) > h.valueOf(leftChild(h, i))
        ? rightChildIndex(i)
        : leftChildIndex(i)

    if (h.valueOf(h.elements[i]) < h.valueOf(h.elements[biggerChildIndex])) {
      swap(h, i, biggerChildIndex)
      return orderDown(h, biggerChildIndex)
    }
  }

  return h
}
