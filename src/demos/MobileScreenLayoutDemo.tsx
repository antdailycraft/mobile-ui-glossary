import { useState } from 'react'

const regions = [
  ['시스템 상태 바', '운영체제가 시계와 배터리 상태를 보여 줍니다.'],
  ['상단 앱 바', '뒤로 가기, 현재 화면 제목, 화면별 작업이 놓입니다.'],
  ['검색과 필터', '현재 화면에서 보여 줄 내용의 범위를 좁힙니다.'],
  ['본문', '메시지나 검색 결과를 읽고 스크롤하는 영역입니다.'],
  ['하단 탐색·작업', '주요 화면을 전환하거나 메시지 입력 같은 작업을 수행합니다.'],
  ['시스템 탐색 영역', '운영체제가 뒤로 가기나 홈 제스처를 제공합니다.'],
] as const

export default function MobileScreenLayoutDemo() {
  const [active, setActive] = useState(3)
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto bg-surface p-4 text-on-surface">
      <div className="flex min-h-72 flex-1 flex-col overflow-hidden rounded-xl border border-outline-variant">
        {regions.map(([name], index) => (
          <button key={name} type="button" aria-pressed={index === active} onClick={() => setActive(index)}
            className={`min-h-11 px-3 py-2 text-start text-body-sm focus-visible:outline-2 focus-visible:-outline-offset-2 ${index === 3 ? 'flex-1' : ''} ${index === active ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface'}`}>
            {name}
          </button>
        ))}
      </div>
      <p role="status" className="rounded-lg bg-surface-container-high p-3 text-body-sm">{regions[active]?.[1]}</p>
    </div>
  )
}
