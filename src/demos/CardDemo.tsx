import { useState } from 'react'
import { Icon } from '../components/Icon'
import { DemoScreen } from './_shared/DemoScreen'

type Variant = 'elevated' | 'filled' | 'outlined'

const CARDS: { id: number; variant: Variant; title: string; sub: string; body: string }[] = [
  { id: 1, variant: 'elevated', title: '제주 오름 트레킹', sub: 'Elevated card', body: '그림자로 배경에서 살짝 떠 보입니다.' },
  { id: 2, variant: 'filled', title: '부산 야경 투어', sub: 'Filled card', body: '그림자 없이 진한 배경색으로 구분합니다.' },
  { id: 3, variant: 'outlined', title: '전주 한옥 마을', sub: 'Outlined card', body: '테두리로 경계를 표시합니다.' },
]

const VARIANT_CLASS: Record<Variant, string> = {
  elevated: 'bg-surface-container-low shadow-elev-1',
  filled: 'bg-surface-container-highest',
  outlined: 'bg-surface border border-outline-variant',
}

export default function CardDemo() {
  const [saved, setSaved] = useState<number[]>([])
  const [status, setStatus] = useState('카드 아무 곳이나 누르면 상세로, 북마크 아이콘은 저장만 합니다.')

  return (
    <DemoScreen title="여행지" status={status}>
      <ul className="flex flex-col gap-3 px-4 pb-6">
        {CARDS.map((c) => {
          const isSaved = saved.includes(c.id)
          return (
            // 카드 전체를 <button>으로 감싸면 안의 북마크 버튼이 "버튼 안의 버튼"이 되어 HTML상 잘못된 구조가 된다.
            // 그래서 제목 버튼의 ::after를 카드 전체로 늘려 클릭 영역만 넓히고, 북마크 버튼은 그 위(z-10)에 올린다.
            <li key={c.id} className={`state-layer relative overflow-hidden rounded-xl ${VARIANT_CLASS[c.variant]}`}>
              <div
                aria-hidden="true"
                className="h-24 bg-gradient-to-br from-primary-container via-tertiary-container to-secondary-container"
              />
              <div className="flex items-start gap-2 py-3 pl-4 pr-1">
                <div className="min-w-0 flex-1">
                  <h3 className="text-title-md">
                    <button
                      type="button"
                      onClick={() => setStatus(`“${c.title}” 카드를 눌러 상세 화면으로 이동했습니다.`)}
                      className="text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-primary"
                    >
                      {c.title}
                    </button>
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">{c.sub}</p>
                  <p className="mt-1 text-body-md text-on-surface-variant">{c.body}</p>
                </div>
                <button
                  type="button"
                  aria-label={`${c.title} 저장`}
                  aria-pressed={isSaved}
                  onClick={() => {
                    setSaved((s) => (isSaved ? s.filter((x) => x !== c.id) : [...s, c.id]))
                    setStatus(
                      isSaved
                        ? `“${c.title}” 저장을 취소했습니다. 카드 상세로는 이동하지 않았습니다.`
                        : `“${c.title}”을(를) 저장했습니다. 카드 상세로는 이동하지 않았습니다.`,
                    )
                  }}
                  // 카드 전체로 늘린 제목 버튼의 클릭 영역 위로 올려야 이 버튼이 따로 눌린다.
                  className={`state-layer relative z-10 inline-flex size-12 shrink-0 items-center justify-center rounded-full ${
                    isSaved ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {isSaved ? <Icon name="bookmark" /> : <BookmarkBorderIcon />}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </DemoScreen>
  )
}

/** 저장 전 상태를 채워진 아이콘과 구분하기 위한 테두리 북마크(공용 아이콘 세트에 없어 이 데모에만 둔다). */
function BookmarkBorderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18L7 18V5h10v13z" />
    </svg>
  )
}
