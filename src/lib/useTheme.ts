import { useCallback, useEffect, useState } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'mug-theme' // index.html의 사전 스크립트와 같은 키를 써야 한다.

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    // 사생활 보호 모드 등에서는 저장소 접근이 막힐 수 있다. 시스템 설정으로 대신한다.
  }
  return 'system'
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(readStored)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && media.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    }
    apply()
    // 시스템 모드일 때만 OS 설정 변경을 따라간다.
    if (mode !== 'system') return
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [mode])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // 저장에 실패해도 현재 세션에서는 테마가 바뀐 상태로 유지된다.
    }
  }, [])

  return { mode, setMode }
}
