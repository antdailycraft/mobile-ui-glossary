// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SnackbarDemo from './SnackbarDemo'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const archiveFirst = () => fireEvent.click(screen.getAllByRole('button', { name: /의 메일 보관$/ })[0]!)
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))

describe('SnackbarDemo', () => {
  it('메일을 다시 채우면 이전 실행 취소를 없애 중복 복원을 막는다', () => {
    render(<SnackbarDemo />)
    for (let i = 0; i < 4; i++) archiveFirst()
    fireEvent.click(screen.getByRole('button', { name: '메일 다시 채우기' }))
    expect(screen.getAllByRole('button', { name: /의 메일 보관$/ })).toHaveLength(4)
    expect(screen.queryByRole('button', { name: '실행 취소' })).toBeNull()
  })

  it('실행 취소는 원래 위치에 메일을 한 번만 복원한다', () => {
    render(<SnackbarDemo />)
    fireEvent.click(screen.getByRole('button', { name: '이서준의 메일 보관' }))
    fireEvent.click(screen.getByRole('button', { name: '실행 취소' }))
    expect(screen.getAllByRole('button', { name: /의 메일 보관$/ }).map((button) => button.getAttribute('aria-label')))
      .toEqual(['김지민의 메일 보관', '이서준의 메일 보관', '박하늘의 메일 보관', '최유나의 메일 보관'])
    expect(screen.queryByRole('button', { name: '실행 취소' })).toBeNull()
  })

  it('포인터가 떠나도 실행 취소에 키보드 포커스가 있으면 시간을 멈춘다', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    render(<SnackbarDemo />)
    archiveFirst()
    advance(1000)
    const undo = screen.getByRole('button', { name: '실행 취소' })
    const snackbar = undo.parentElement!
    fireEvent.pointerEnter(snackbar)
    act(() => undo.focus())
    fireEvent.pointerLeave(snackbar)
    advance(5000)
    expect(screen.queryByRole('button', { name: '실행 취소' })).not.toBeNull()
    act(() => undo.blur())
    advance(2999)
    expect(screen.queryByRole('button', { name: '실행 취소' })).not.toBeNull()
    advance(1)
    expect(screen.queryByRole('button', { name: '실행 취소' })).toBeNull()
  })

  it('키보드 포커스가 떠나도 포인터가 위에 있으면 시간을 멈춘다', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    render(<SnackbarDemo />)
    archiveFirst()
    const undo = screen.getByRole('button', { name: '실행 취소' })
    const snackbar = undo.parentElement!
    act(() => undo.focus())
    fireEvent.pointerEnter(snackbar)
    act(() => undo.blur())
    advance(5000)
    expect(screen.queryByRole('button', { name: '실행 취소' })).not.toBeNull()
    fireEvent.pointerLeave(snackbar)
    advance(4000)
    expect(screen.queryByRole('button', { name: '실행 취소' })).toBeNull()
  })
})
