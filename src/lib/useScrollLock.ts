import { useEffect } from 'react'

/** 모달 드로어가 열려 있을 때 뒤쪽 페이지가 함께 스크롤되지 않도록 막는다. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [locked])
}
