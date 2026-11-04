import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

interface DragEnd {
  /** 시작점 대비 이동 거리(px). 아래·오른쪽이 양수다. */
  offset: number
  /** 손을 뗄 때의 속도(px/ms). 빠르게 튕기는 제스처를 거리와 별개로 판정할 때 쓴다. */
  velocity: number
}

interface Options {
  axis: 'x' | 'y'
  onEnd: (end: DragEnd) => void
}

/** 이 거리보다 적게 움직였다면 드래그가 아니라 탭으로 본다. */
const TAP_SLOP = 6

/**
 * 포인터 이벤트 하나로 마우스·터치·펜 드래그를 모두 처리하는 훅.
 * 끌기 시작하면 setPointerCapture를 걸어 손가락이 요소 밖으로 나가도 끝까지 추적한다.
 * 드래그 대상 요소에는 브라우저 기본 스크롤을 막기 위해 `touch-action: none`을 함께 지정해야 한다.
 */
export function useDrag({ axis, onEnd }: Options) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ pos: number; id: number } | null>(null)
  // 속도는 마지막 두 샘플로 계산한다. 전체 평균을 쓰면 천천히 끌다 마지막에 튕긴 제스처를 놓친다.
  const samples = useRef<{ pos: number; t: number }[]>([])
  const moved = useRef(false)

  const posOf = (e: ReactPointerEvent) => (axis === 'y' ? e.clientY : e.clientX)

  const finish = (e: ReactPointerEvent) => {
    if (!start.current || start.current.id !== e.pointerId) return
    const s = samples.current
    const a = s[s.length - 2]
    const b = s[s.length - 1]
    const velocity = a && b && b.t > a.t ? (b.pos - a.pos) / (b.t - a.t) : 0
    const end = { offset: posOf(e) - start.current.pos, velocity }
    start.current = null
    samples.current = []
    setDragging(false)
    setOffset(0)
    if (moved.current) onEnd(end)
  }

  const bind = {
    onPointerDown(e: ReactPointerEvent<HTMLElement>) {
      // 마우스는 왼쪽 버튼만 받는다.
      if (e.pointerType === 'mouse' && e.button !== 0) return
      start.current = { pos: posOf(e), id: e.pointerId }
      samples.current = [{ pos: posOf(e), t: e.timeStamp }]
      moved.current = false
    },
    onPointerMove(e: ReactPointerEvent<HTMLElement>) {
      if (!start.current || start.current.id !== e.pointerId) return
      const d = posOf(e) - start.current.pos
      if (!moved.current && Math.abs(d) < TAP_SLOP) return
      if (!moved.current) {
        // 캡처는 실제로 끌기 시작했을 때 건다. pointerdown에서 바로 캡처하면
        // 단순 탭의 click 이벤트가 자식 버튼이 아니라 드래그 영역에서 발생해 버튼이 눌리지 않는다.
        e.currentTarget.setPointerCapture(e.pointerId)
        moved.current = true
      }
      setDragging(true)
      setOffset(d)
      samples.current = [...samples.current.slice(-1), { pos: posOf(e), t: e.timeStamp }]
    },
    onPointerUp: finish,
    onPointerCancel: finish,
  }

  return {
    offset,
    dragging,
    bind,
    /** 직전 포인터 동작이 드래그였는지 확인한다. 드래그 직후 발생하는 click을 무시할 때 쓴다. */
    wasDrag: () => moved.current,
  }
}
