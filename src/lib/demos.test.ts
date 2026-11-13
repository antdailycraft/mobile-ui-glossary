import { describe, expect, it } from 'vitest'
import { getDemo, resetDemo } from './demos'

describe('데모 캐시', () => {
  it('평소에는 같은 데모를 재사용하고 재시도할 때 해당 데모만 새로 만든다', () => {
    const original = getDemo('SnackbarDemo')
    const other = getDemo('DialogDemo')
    expect(original).toBeDefined()
    expect(getDemo('SnackbarDemo')).toBe(original)
    resetDemo('SnackbarDemo')
    expect(getDemo('SnackbarDemo')).not.toBe(original)
    expect(getDemo('DialogDemo')).toBe(other)
  })

  it('알 수 없는 데모 이름은 초기화 후에도 없는 것으로 처리한다', () => {
    resetDemo('UnknownDemo')
    expect(getDemo('UnknownDemo')).toBeUndefined()
  })
})
