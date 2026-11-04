import type { ReactNode } from 'react'

/**
 * 데모를 담는 화면.
 * 모바일에서는 프레임 없이 콘텐츠 너비를 꽉 채우고, 넓은 화면(md 이상)에서만 360×720 휴대폰 모양 테두리를 씌운다.
 * 내부 요소는 `absolute`로 배치하므로 오버레이(시트·스크림·스낵바)가 이 화면 밖으로 새어 나가지 않는다.
 */
export function PhoneFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="md:mx-auto md:w-fit md:rounded-[48px] md:bg-inverse-surface md:p-3 md:shadow-elev-3">
      <div
        role="region"
        aria-label={label}
        className="relative isolate h-[min(640px,calc(100dvh-120px))] min-h-[520px] w-full overflow-hidden rounded-3xl border border-outline-variant bg-surface md:h-[720px] md:min-h-0 md:w-[360px] md:rounded-[36px] md:border-0"
      >
        {children}
      </div>
    </div>
  )
}
