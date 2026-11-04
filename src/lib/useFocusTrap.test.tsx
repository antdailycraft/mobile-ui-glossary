// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { useFocusTrap } from './useFocusTrap'

afterEach(cleanup)

/** 트리거 버튼과 버튼 3개짜리 모달로 포커스 트랩을 시험하는 최소 구성. */
function Harness() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  useFocusTrap(ref, open, { onEscape: () => setOpen(false), returnFocus: triggerRef })
  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen(true)}>
        열기
      </button>
      <button>바깥</button>
      {open && (
        <div ref={ref} role="dialog" aria-label="모달">
          <p>여백</p>
          <button>첫째</button>
          <button>둘째</button>
          <button onClick={() => setOpen(false)}>닫기</button>
        </div>
      )}
    </>
  )
}

const focusedName = () => (document.activeElement as HTMLElement | null)?.textContent

describe('useFocusTrap', () => {
  it('열리면 첫 요소로 포커스하고, Tab과 Shift+Tab이 모달 안에서만 순환한다', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByText('열기'))
    await waitFor(() => expect(focusedName()).toBe('첫째'))

    await user.tab()
    await user.tab()
    expect(focusedName()).toBe('닫기')
    await user.tab()
    expect(focusedName()).toBe('첫째')
    await user.tab({ shift: true })
    expect(focusedName()).toBe('닫기')
  })

  it('Esc로 닫히고 포커스가 트리거로 돌아간다', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByText('열기'))
    await waitFor(() => expect(focusedName()).toBe('첫째'))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(focusedName()).toBe('열기')
  })

  it('모달의 여백을 눌러 포커스가 컨테이너로 옮겨져도 Esc와 Tab이 계속 동작한다', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByText('열기'))
    await waitFor(() => expect(focusedName()).toBe('첫째'))
    await user.click(screen.getByText('여백'))
    expect(document.activeElement).toBe(screen.getByRole('dialog'))

    await user.tab({ shift: true })
    expect(focusedName()).toBe('닫기')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
