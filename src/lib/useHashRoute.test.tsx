// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useHashRoute } from './useHashRoute'

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

describe('useHashRoute', () => {
  it.each(['%', '%E0%A4%A', '%ZZ'])('잘못된 주소 %s에서도 오류 없이 찾을 수 없음 경로를 반환한다', (hash) => {
    window.history.replaceState(null, '', `/#${hash}`)
    const { result } = renderHook(useHashRoute)
    expect(result.current[0]).toBe(hash)
  })

  it('인코딩된 주소와 슬래시가 있는 기존 링크를 읽는다', () => {
    window.history.replaceState(null, '', '/#/%6Dodal-bottom-sheet')
    const { result } = renderHook(useHashRoute)
    expect(result.current[0]).toBe('modal-bottom-sheet')
  })

  it('잘못된 주소에서 정상 항목으로 이동할 수 있다', async () => {
    window.history.replaceState(null, '', '/#%')
    const { result } = renderHook(useHashRoute)
    act(() => result.current[1]('snackbar'))
    await waitFor(() => expect(result.current[0]).toBe('snackbar'))
  })

  it('해시 변경을 반영하고 빈 주소를 허용한다', () => {
    const { result } = renderHook(useHashRoute)
    expect(result.current[0]).toBe('')
    act(() => {
      window.history.replaceState(null, '', '/#dialog')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(result.current[0]).toBe('dialog')
  })
})
