import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/**
 * CSS 미디어 쿼리만으로 처리할 수 없는 JS 애니메이션(드래그 후 튕겨 돌아가기 등)에서
 * 사용자의 "동작 줄이기" 설정을 확인할 때 쓴다.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false)
}
