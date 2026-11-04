import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const focusablesIn = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest('[inert]'))

interface Options {
  /** 열릴 때 처음 포커스할 요소. 없으면 컨테이너 안의 첫 번째 포커스 가능 요소로 옮긴다. */
  initialFocus?: RefObject<HTMLElement | null>
  /** Esc를 누르면 호출한다. */
  onEscape?: () => void
  /**
   * 닫힐 때 포커스를 돌려줄 요소. 지정하지 않으면 열기 직전의 activeElement로 돌아간다.
   * Safari는 버튼을 클릭해도 포커스를 주지 않아 activeElement가 body일 수 있으므로, 트리거를 알고 있다면 지정하는 편이 안전하다.
   */
  returnFocus?: RefObject<HTMLElement | null>
}

/**
 * 모달이 열려 있는 동안 Tab 포커스를 컨테이너 안에서만 순환시킨다.
 * 닫히면 열기 직전에 포커스가 있던 요소(보통 트리거 버튼)로 포커스를 되돌린다.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean, options: Options = {}) {
  const { initialFocus, onEscape, returnFocus } = options
  // onEscape는 렌더마다 새 함수가 될 수 있다. ref에 담아 두어 트랩이 매번 다시 걸리지 않게 한다.
  const onEscapeRef = useRef(onEscape)
  useEffect(() => {
    onEscapeRef.current = onEscape
  })

  useEffect(() => {
    const container = containerRef.current
    if (!active || !container) return
    const previouslyFocused = document.activeElement as HTMLElement | null

    const target = initialFocus?.current ?? focusablesIn(container)[0] ?? container
    // 열림 전환이 시작된 뒤 포커스해야 일부 브라우저에서 스크롤 점프가 생기지 않는다.
    const raf = requestAnimationFrame(() => target.focus({ preventScroll: true }))

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscapeRef.current) {
        e.stopPropagation()
        onEscapeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusablesIn(container)
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]!
      const last = items[items.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    container.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(raf)
      container.removeEventListener('keydown', onKeyDown)
      ;(returnFocus?.current ?? previouslyFocused)?.focus?.({ preventScroll: true })
    }
  }, [active, containerRef, initialFocus, returnFocus])
}
