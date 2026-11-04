import { useCallback, useSyncExternalStore } from 'react'

/**
 * 미디어 쿼리 일치 여부를 구독한다.
 * useSyncExternalStore로 첫 렌더부터 실제 값을 읽으므로, 데스크톱에서 모바일 레이아웃이 잠깐 보였다 바뀌는 깜빡임이 없다.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
