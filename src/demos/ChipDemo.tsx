import { useState, type ReactNode } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { DemoScreen } from './_shared/DemoScreen'

const FILTERS = ['영업 중', '주차 가능', '예약 가능', '반려동물']
const SUGGESTIONS = ['근처 카페', '디저트', '브런치']
const ASSISTS: { icon: IconName; label: string }[] = [
  { icon: 'place', label: '길찾기' },
  { icon: 'share', label: '공유' },
  { icon: 'bookmark', label: '저장' },
]

/*
 * M3 칩의 시각 높이는 32px이지만 터치 영역은 그보다 커야 한다.
 * ::after로 위아래 6px씩 투명한 영역을 덧대 44px 터치 영역을 만든다(::before는 state-layer가 쓴다).
 */
const chipBase =
  "state-layer relative inline-flex h-8 items-center gap-2 rounded-lg px-4 text-label-lg after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']"

export default function ChipDemo() {
  const [filters, setFilters] = useState<string[]>([])
  const [terms, setTerms] = useState<string[]>(['강남', '파스타'])
  const [status, setStatus] = useState('칩을 눌러 보세요. 종류마다 누를 때의 의미가 다릅니다.')

  const toggleFilter = (f: string) => {
    const on = !filters.includes(f)
    setFilters((prev) => (on ? [...prev, f] : prev.filter((x) => x !== f)))
    setStatus(`필터 칩 “${f}”을(를) ${on ? '선택' : '해제'}했습니다. 필터 칩은 켜고 끄는 상태가 있습니다.`)
  }

  const addTerm = (t: string) => {
    if (terms.includes(t)) return setStatus(`“${t}”은(는) 이미 검색어에 있습니다.`)
    setTerms((prev) => [...prev, t])
    setStatus(`제안 칩 “${t}”을(를) 눌러 검색어(입력 칩)로 추가했습니다.`)
  }

  const removeTerm = (t: string) => {
    setTerms((prev) => prev.filter((x) => x !== t))
    setStatus(`입력 칩 “${t}”을(를) 삭제했습니다.`)
  }

  return (
    <DemoScreen title="맛집 찾기" status={status}>
      <div className="flex flex-col gap-5 px-4 pb-6">
        <Section title="Input chip · 입력한 검색어">
          {terms.length === 0 && <p className="text-body-md text-on-surface-variant">검색어가 없습니다.</p>}
          {terms.map((t) => (
            <span key={t} className="inline-flex h-8 items-center rounded-lg border border-outline-variant pl-3 text-label-lg">
              {t}
              {/* 칩 전체가 아니라 삭제 아이콘만 버튼이다. 터치 영역은 칩 높이보다 크게 잡는다. */}
              <button
                type="button"
                aria-label={`${t} 삭제`}
                onClick={() => removeTerm(t)}
                className="state-layer -my-1.5 ml-0.5 inline-flex size-11 items-center justify-center rounded-full text-on-surface-variant"
              >
                <Icon name="close" className="size-[18px]" />
              </button>
            </span>
          ))}
        </Section>

        <Section title="Filter chip · 결과 거르기">
          {FILTERS.map((f) => {
            const on = filters.includes(f)
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => toggleFilter(f)}
                className={`${chipBase} ${
                  on
                    ? 'bg-secondary-container pl-2 text-on-secondary-container'
                    : 'border border-outline-variant text-on-surface-variant'
                }`}
              >
                {on && <Icon name="check" className="size-[18px]" />}
                {f}
              </button>
            )
          })}
          <p className="w-full text-body-sm text-on-surface-variant">
            {filters.length ? `조건 ${filters.length}개 적용 · 결과 ${12 - filters.length * 3}곳` : '조건 없음 · 결과 12곳'}
          </p>
        </Section>

        <Section title="Suggestion chip · 추천 검색어">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTerm(s)}
              className={`${chipBase} border border-outline-variant text-on-surface-variant`}
            >
              {s}
            </button>
          ))}
        </Section>

        <Section title="Assist chip · 바로 하기">
          {ASSISTS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => setStatus(`보조 칩 “${a.label}”을(를) 눌렀습니다. 보조 칩은 관련 동작을 바로 실행합니다.`)}
              className={`${chipBase} border border-outline-variant pl-2 text-on-surface`}
            >
              <Icon name={a.icon} className="size-[18px] text-primary" />
              {a.label}
            </button>
          ))}
        </Section>
      </div>
    </DemoScreen>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-title-sm text-on-surface-variant">{title}</h3>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3">{children}</div>
    </section>
  )
}
