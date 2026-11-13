import { useCallback, useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const getHashId = () => {
  const hash = window.location.hash.replace(/^#\/?/, '')
  try {
    return decodeURIComponent(hash)
  } catch {
    // 잘못 인코딩된 공유 주소도 앱 전체 오류 대신 기존의 찾을 수 없음 화면으로 보낸다.
    return hash
  }
}

/**
 * URL 해시(/#modal-bottom-sheet)를 선택 상태의 단일 출처로 쓴다.
 * 별도 라우터 없이도 링크 공유와 뒤로 가기가 동작한다.
 */
export function useHashRoute(): [string, (id: string) => void] {
  const id = useSyncExternalStore(subscribe, getHashId, () => '')
  const navigate = useCallback((next: string) => {
    if (getHashId() !== next) window.location.hash = next
  }, [])
  return [id, navigate]
}
