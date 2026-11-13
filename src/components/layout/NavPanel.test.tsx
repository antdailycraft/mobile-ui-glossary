// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NavPanel } from './NavPanel'
import type { ComponentEntry } from '../../lib/types'

// 이 테스트는 탐색 UI만 다룬다. 실제 MDX 데이터는 content.test.ts에서 검증한다.
vi.mock('../../lib/content', () => ({
  groupByCategory: (items: ComponentEntry[]) => ['overlay', 'navigation', 'component', 'interaction']
    .map((category) => ({ category, items: items.filter((item) => item.category === category) }))
    .filter((group) => group.items.length),
}))

afterEach(cleanup)

const items: ComponentEntry[] = [
  { id: 'modal-bottom-sheet', name: 'Modal Bottom Sheet', aliases: ['바텀 시트'], category: 'overlay', platforms: ['material', 'ios'], summary: '', related: [], demo: 'X', Body: () => <></> },
  { id: 'action-sheet', name: 'Action Sheet', aliases: ['액션 시트'], category: 'overlay', platforms: ['ios'], summary: '', related: [], demo: 'X', Body: () => <></> },
  { id: 'bottom-navigation', name: 'Bottom Navigation', aliases: [], category: 'navigation', platforms: ['material'], summary: '', related: [], demo: 'X', Body: () => <></> },
]

function setup(clearOnSelect = false) {
  const onNavigate = vi.fn()
  const onSelect = vi.fn()
  const inputRef = createRef<HTMLInputElement>()
  render(<NavPanel header={<h1>목록</h1>} items={items} currentId="action-sheet" onNavigate={onNavigate}
    onSelect={onSelect} clearOnSelect={clearOnSelect} activeItemRef={createRef()} inputRef={inputRef} />)
  return { user: userEvent.setup(), onNavigate, onSelect, input: screen.getByRole('searchbox'), inputRef }
}

const links = () => within(screen.getByRole('navigation', { name: '컴포넌트' })).getAllByRole('link')

describe('NavPanel', () => {
  it('검색과 두 필터를 조합하고 빈 결과에서 초기화할 수 있다', async () => {
    const { user, input } = setup()
    await user.type(input, 'sheet')
    await user.selectOptions(screen.getByLabelText('플랫폼'), 'ios')
    expect(links()).toHaveLength(2)
    await user.selectOptions(screen.getByLabelText('카테고리'), 'navigation')
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('검색 결과 0개')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }))
    expect(links()).toHaveLength(3)
    expect(document.activeElement).toBe(input)
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('한글 조합 중 Enter·방향키와 229 이벤트는 탐색하지 않는다', async () => {
    const { user, input, onNavigate, onSelect } = setup()
    await user.type(input, '바텀')
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })
    fireEvent.keyDown(input, { key: 'ArrowDown', isComposing: true })
    expect(onNavigate).not.toHaveBeenCalled()
    expect(onSelect).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(input)
    await user.keyboard('{Enter}')
    expect(onNavigate).toHaveBeenCalledWith('modal-bottom-sheet')
  })

  it('검색어를 지운 뒤 검색창에 포커스를 유지하고 플랫폼 필터를 유지한다', async () => {
    const { user, input, inputRef } = setup()
    expect(inputRef.current).toBe(input)
    await user.selectOptions(screen.getByLabelText('플랫폼'), 'ios')
    await user.type(input, 'modal')
    await user.click(screen.getByRole('button', { name: '검색어 지우기' }))
    expect(document.activeElement).toBe(input)
    expect(links()).toHaveLength(2)
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(links()[0])
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(links()[1])
  })

  it('모바일에서 항목을 선택하면 조건을 지우고 닫기 콜백을 호출한다', async () => {
    const { user, input, onSelect } = setup(true)
    await user.selectOptions(screen.getByLabelText('플랫폼'), 'ios')
    await user.type(input, 'modal')
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledOnce()
    expect(links()).toHaveLength(3)
    expect((screen.getByLabelText('플랫폼') as HTMLSelectElement).value).toBe('')
  })

  it('검색 결과가 없으면 Enter로 이동하지 않는다', async () => {
    const { user, input, onNavigate } = setup()
    await user.type(input, '없는항목{Enter}')
    expect(onNavigate).not.toHaveBeenCalled()
  })
})
