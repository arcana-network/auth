import { getUniqueId } from '../src/utils'

describe('utils.ts', () => {
  test('computeAddress', () => {
    const num = getUniqueId()
    expect(num).not.toBe(0)
  })
})
