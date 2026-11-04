import type { ReactNode } from 'react'

interface Props {
  title: string
  /** 앱 바 왼쪽(내비게이션 아이콘 자리) */
  leading?: ReactNode
  /** 앱 바 오른쪽 액션 아이콘들 */
  actions?: ReactNode
  /** 방금 일어난 동작을 알려 주는 한 줄. 스크린 리더에도 읽힌다. */
  status?: string
  children: ReactNode
}

/** 데모 안의 가짜 앱 화면. 모든 데모가 같은 앱 바와 동작 기록 줄을 갖도록 맞춘다. */
export function DemoScreen({ title, leading, actions, status, children }: Props) {
  return (
    <div className="flex h-full flex-col bg-surface text-on-surface">
      <header className="flex h-16 shrink-0 items-center gap-1 px-1">
        {leading ?? <span className="w-3" />}
        <p className="min-w-0 flex-1 truncate px-1 text-title-lg">{title}</p>
        {actions}
      </header>
      <p
        role="status"
        className="mx-4 mb-2 shrink-0 rounded-lg bg-surface-container-high px-3 py-2 text-body-sm text-on-surface-variant"
      >
        {status}
      </p>
      <div className="relative min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
