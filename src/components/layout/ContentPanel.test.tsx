// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContentPanel } from './ContentPanel'
import type { ComponentEntry } from '../../lib/types'

vi.mock('../../lib/content', () => ({ getComponent: () => undefined }))
vi.mock('./DemoHost', () => ({
  DemoHost: () => <section id="demo-section"><h2 id="demo-heading" tabIndex={-1}>실동작 데모</h2></section>,
}))

const originalScrollIntoView = Element.prototype.scrollIntoView

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  if (originalScrollIntoView) Element.prototype.scrollIntoView = originalScrollIntoView
  else Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
})

const entry: ComponentEntry = {
  id: 'example', name: '예시', aliases: [], category: 'overlay', platforms: ['material'],
  summary: '예시 설명', related: [], demo: 'ExampleDemo', Body: () => <p>본문</p>,
}

describe('ContentPanel 데모 이동', () => {
  it.each([true, false])('동작 줄이기 설정(%s)에 맞춰 이동하며 제목에 포커스를 둔다', (reduced) => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    render(<ContentPanel entry={entry} />)
    fireEvent.click(screen.getByRole('button', { name: '데모 바로 보기 ↓' }))
    expect(scroll).toHaveBeenCalledWith({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: '실동작 데모' }))
  })
})
