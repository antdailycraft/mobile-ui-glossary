// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { lazy, useState, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoHost } from './DemoHost'
import { getDemo, resetDemo } from '../../lib/demos'

vi.mock('../../lib/demos', () => ({ getDemo: vi.fn(), resetDemo: vi.fn() }))

beforeEach(() => {
  // 실패를 의도적으로 일으키는 테스트에서 React의 정상적인 오류 보고만 숨긴다.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.mocked(getDemo).mockReset()
  vi.mocked(resetDemo).mockReset()
})

// lazy 로딩의 Promise와 React 업데이트를 함께 마쳐 실제 시간 지연에 기대지 않는다.
const renderReady = async (node: ReactNode) => {
  await act(async () => { render(node) })
}
const clickReady = async (button: HTMLElement) => {
  await act(async () => { fireEvent.click(button) })
}

const loaded = () => lazy(async () => ({ default: () => <p>복구된 데모</p> }))
const failed = () => lazy(() => Promise.reject(new Error('데모 파일 로딩 실패')))

describe('DemoHost', () => {
  it('로딩 실패를 데모 안에 격리하고 다시 시도하면 복구한다', async () => {
    vi.mocked(getDemo).mockReturnValue(failed())
    vi.mocked(resetDemo).mockImplementation(() => { vi.mocked(getDemo).mockReturnValue(loaded()) })
    await renderReady(<><h1>용어 설명</h1><DemoHost demo="ExampleDemo" title="예시" /><a href="#dialog">다른 컴포넌트</a></>)
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('heading', { name: '용어 설명' })).toBeTruthy()
    expect(screen.getByRole('link', { name: '다른 컴포넌트' })).toBeTruthy()
    await clickReady(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByText('복구된 데모')).toBeTruthy()
    expect(resetDemo).toHaveBeenCalledWith('ExampleDemo')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: '실동작 데모' }))
  })

  it('실패가 계속되면 안내와 새로고침 수단을 유지한다', async () => {
    vi.mocked(getDemo).mockReturnValue(failed())
    await renderReady(<DemoHost demo="ExampleDemo" title="예시" />)
    await screen.findByRole('alert')
    await clickReady(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('button', { name: '페이지 새로고침' })).toBeTruthy()
  })

  it('렌더링 오류도 격리하고 초기화 버튼으로 재시도한다', async () => {
    vi.mocked(getDemo).mockReturnValue(lazy(async () => ({ default: () => { throw new Error('렌더링 오류') } })))
    vi.mocked(resetDemo).mockImplementation(() => { vi.mocked(getDemo).mockReturnValue(loaded()) })
    await renderReady(<DemoHost demo="ExampleDemo" title="예시" />)
    await screen.findByRole('alert')
    await clickReady(screen.getByRole('button', { name: '초기화' }))
    expect(await screen.findByText('복구된 데모')).toBeTruthy()
  })

  it('정상 데모의 초기화는 조작한 상태를 처음으로 되돌린다', async () => {
    function Counter() {
      const [count, setCount] = useState(0)
      return <button onClick={() => setCount(count + 1)}>횟수 {count}</button>
    }
    vi.mocked(getDemo).mockReturnValue(lazy(async () => ({ default: Counter })))
    await renderReady(<DemoHost demo="CounterDemo" title="예시" />)
    fireEvent.click(await screen.findByRole('button', { name: '횟수 0' }))
    expect(screen.getByRole('button', { name: '횟수 1' })).toBeTruthy()
    await clickReady(screen.getByRole('button', { name: '초기화' }))
    expect(await screen.findByRole('button', { name: '횟수 0' })).toBeTruthy()
  })
})
