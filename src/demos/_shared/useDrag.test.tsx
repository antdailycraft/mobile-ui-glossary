// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useDrag } from './useDrag'

afterEach(cleanup)

beforeAll(() => {
  // jsdom에는 포인터 캡처 API가 없다. 동작 자체는 브라우저 몫이므로 빈 함수로 대신한다.
  HTMLElement.prototype.setPointerCapture ??= () => {}
})

function Harness({ onEnd, onClick }: { onEnd: (e: { offset: number; velocity: number }) => void; onClick: () => void }) {
  const { bind, offset } = useDrag({ axis: 'y', onEnd })
  return (
    <div data-testid="zone" data-offset={offset} {...bind}>
      <button onClick={onClick}>안쪽 버튼</button>
    </div>
  )
}

const pointer = (type: 'pointerDown' | 'pointerMove' | 'pointerUp', el: Element, clientY: number, timeStamp = 0) => {
  const init = { pointerId: 1, pointerType: 'touch', clientY, button: 0 }
  // fireEvent는 timeStamp를 지정할 수 없으므로 이벤트를 만든 뒤 덮어쓴다.
  const event = new PointerEvent(type.toLowerCase(), { bubbles: true, ...init })
  Object.defineProperty(event, 'timeStamp', { value: timeStamp })
  fireEvent(el, event)
}

describe('useDrag', () => {
  it('허용 오차보다 적게 움직이면 드래그가 아니라 탭으로 보고 onEnd를 부르지 않는다', () => {
    const onEnd = vi.fn()
    const onClick = vi.fn()
    render(<Harness onEnd={onEnd} onClick={onClick} />)
    const button = screen.getByText('안쪽 버튼')
    pointer('pointerDown', button, 100, 0)
    pointer('pointerMove', button, 103, 10)
    pointer('pointerUp', button, 103, 20)
    fireEvent.click(button)
    expect(onEnd).not.toHaveBeenCalled()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('끌고 놓으면 이동 거리와 마지막 구간의 속도를 넘긴다', () => {
    const onEnd = vi.fn()
    render(<Harness onEnd={onEnd} onClick={() => {}} />)
    const zone = screen.getByTestId('zone')
    pointer('pointerDown', zone, 100, 0)
    pointer('pointerMove', zone, 150, 100)
    expect(zone.dataset.offset).toBe('50')
    pointer('pointerMove', zone, 250, 120)
    pointer('pointerUp', zone, 250, 130)

    expect(onEnd).toHaveBeenCalledOnce()
    const { offset, velocity } = onEnd.mock.calls[0]![0]
    expect(offset).toBe(150)
    // 마지막 두 샘플: (150, 100ms) → (250, 120ms) = 5px/ms
    expect(velocity).toBeCloseTo(5)
    expect(zone.dataset.offset).toBe('0')
  })
})
