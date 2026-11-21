import type { ReactNode } from 'react'

/**
 * 데모를 담는 화면.
 * 모든 데모에 같은 휴대폰 테두리를 씌우고, 좁은 화면에서는 본문 너비에 맞춰 줄인다.
 * 내부 요소는 `absolute`로 배치하므로 오버레이(시트·스크림·스낵바)가 이 화면 밖으로 새어 나가지 않는다.
 */
export function PhoneFrame({ label, children, showGuide }: { label: string; children: ReactNode; showGuide: boolean }) {
  return (
    <div
      className="mx-auto w-full max-w-[20.75rem] rounded-[2.125rem] border border-outline-variant bg-inverse-surface p-[0.3125rem] shadow-elev-2 dark:bg-surface-container-highest"
    >
      <div
        data-demo-guide={showGuide ? 'on' : undefined}
        role="region"
        aria-label={label}
        className="relative isolate h-[clamp(22.5rem,calc(100dvh-12.5rem),35rem)] w-full overflow-hidden rounded-[1.75rem] bg-surface"
      >
        {children}
      </div>
    </div>
  )
}
