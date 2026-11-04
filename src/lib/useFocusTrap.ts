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

    // 컨테이너 자체를 포커스 가능(tabindex=-1)하게 만든다. 그래야 스크림이나 패널 여백처럼
    // 포커스할 수 없는 곳을 눌러도 포커스가 body로 빠지지 않고 컨테이너에 머문다.
    const addedTabIndex = !container.hasAttribute('tabindex')
    if (addedTabIndex) container.setAttribute('tabindex', '-1')

    const target = initialFocus?.current ?? focusablesIn(container)[0] ?? container
    // 열림 전환이 시작된 뒤 포커스해야 일부 브라우저에서 스크롤 점프가 생기지 않는다.
    const raf = requestAnimationFrame(() => target.focus({ preventScroll: true }))

    const onKeyDown = (e: KeyboardEvent) => {
      const focused = document.activeElement
      // 포커스가 컨테이너 안에 있거나, 어딘가로 새어 body에 떨어졌을 때만 처리한다.
      // 페이지의 다른 곳(예: 데모 바깥의 검색창)에 사용자가 직접 포커스를 옮긴 경우는 건드리지 않는다.
      const leaked = !focused || focused === document.body
      if (!leaked && !container.contains(focused)) return

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
      if (leaked) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (e.shiftKey && (focused === first || focused === container)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && focused === last) {
        e.preventDefault()
        first.focus()
      }
    }
    // 컨테이너가 아니라 document에서 듣는다. 포커스가 이미 밖으로 샌 뒤에도 Esc와 Tab을 받기 위해서다.
    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      if (addedTabIndex) container.removeAttribute('tabindex')
      ;(returnFocus?.current ?? previouslyFocused)?.focus?.({ preventScroll: true })
    }
  }, [active, containerRef, initialFocus, returnFocus])
}
