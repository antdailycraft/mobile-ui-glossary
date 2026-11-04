// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import ActionSheetDemo from './ActionSheetDemo'

afterEach(cleanup)

const status = () => screen.getByRole('status').textContent

describe('ActionSheetDemo', () => {
  it('iPhone 동작처럼 바깥(스크림)을 눌러도 닫히지 않고, “취소”로만 닫힌다', async () => {
    const user = userEvent.setup()
    const { container } = render(<ActionSheetDemo />)
    const sheet = container.querySelector('[role="dialog"]')!
    await user.click(screen.getByText('더 보기'))
    expect(sheet.hasAttribute('inert')).toBe(false)

    await user.click(container.querySelector('.bg-scrim')!)
    expect(sheet.hasAttribute('inert')).toBe(false)
    expect(status()).toContain('바깥을 눌러도 닫히지 않습니다')

    await user.click(screen.getByText('취소'))
    expect(sheet.hasAttribute('inert')).toBe(true)
    expect(status()).toContain('“취소”를 눌러')
  })

  it('Esc 키로도 닫을 수 있다(키보드 접근성)', async () => {
    const user = userEvent.setup()
    const { container } = render(<ActionSheetDemo />)
    const sheet = container.querySelector('[role="dialog"]')!
    await user.click(screen.getByText('더 보기'))
    // 첫 포커스는 가장 안전한 “취소”에 놓인다.
    await waitFor(() => expect(document.activeElement).toBe(screen.getByText('취소')))
    await user.keyboard('{Escape}')
    expect(document.activeElement).toBe(screen.getByText('더 보기'))
    expect(sheet.hasAttribute('inert')).toBe(true)
  })
})
