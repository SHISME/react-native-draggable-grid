import { findIndex, findKey, differenceBy } from '../src/utils'

describe('utils 方法测试', () => {
  const arr = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
  it('findIndex 方法', () => {
    expect(findIndex(arr, item => item.id === 1)).toBe(0)
    expect(findIndex(arr, item => item.id === 5)).toBe(-1)
  })
  it('findKey 方法', () => {
    const map = {
      1: { val: 1 },
      2: { val: 2 },
      3: { val: 3 },
    }
    expect(findKey(map, item => item.val === 1)).toBe('1')
    expect(findKey(map, item => item.val === 5)).toBe(undefined)
  })
  it('differenceBy 方法', () => {
    const arr2 = [{ id: 1 }, { id: 3 }, { id: 5 }]
    expect(differenceBy(arr, arr2, 'id')).toMatchObject([{ id: 2 }, { id: 4 }])
    expect(differenceBy(arr2, arr, 'id')).toMatchObject([{ id: 5 }])
  })
})
