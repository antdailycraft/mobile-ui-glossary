import { useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '../components/Icon'
import { DemoScreen } from './_shared/DemoScreen'

/** 받침 유무에 따라 조사를 고른다. 상태 문구에 들어가는 라벨이 바뀌어도 "알림으로", "도보를"처럼 자연스럽게 읽히게 하기 위해서다. */
const finalOf = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code <= 11171 ? code % 28 : 0
}
const withEul = (w: string) => `“${w}”${finalOf(w) ? '을' : '를'}`


const PERIODS = ['일', '주', '월', '년']
const PERIOD_TEXT: Record<string, string> = {
  일: '오늘 걸음 수 8,214보',
  주: '이번 주 평균 7,530보',
  월: '11월 평균 6,980보',
  년: '올해 평균 7,102보',
}

const ROUTES = ['도보', '대중교통', '자동차']
const FILTERS = ['주차', '와이파이', '반려동물']

export default function SegmentedControlDemo() {
  const [period, setPeriod] = useState(1)
  const [route, setRoute] = useState(1)
  const [filters, setFilters] = useState<Set<string>>(new Set(['와이파이']))
  const [status, setStatus] = useState('각 컨트롤을 눌러 보세요. 키보드로는 화살표 키로 선택을 옮길 수 있습니다.')

  return (
    <DemoScreen title="보기 설정" status={status}>
      <div className="space-y-6 px-4 pb-6">
        <section aria-labelledby="sc-ios">
          <h3 id="sc-ios" className="mb-2 text-title-sm text-on-surface-variant">
            iOS Segmented Control
          </h3>
          <IosSegmented
            label="기간"
            options={PERIODS}
            value={period}
            onChange={(i) => {
              setPeriod(i)
              setStatus(`iOS: ${withEul(PERIODS[i]!)} 골랐습니다. 썸이 미끄러지며 선택을 옮기고, 아래 내용이 바로 바뀝니다.`)
            }}
          />
          <p className="mt-3 rounded-xl bg-surface-container p-4 text-body-lg">{PERIOD_TEXT[PERIODS[period]!]}</p>
        </section>

        <section aria-labelledby="sc-m3-single">
          <h3 id="sc-m3-single" className="mb-2 text-title-sm text-on-surface-variant">
            M3 Segmented button · 단일 선택
          </h3>
          <M3Segmented
            label="이동 수단"
            options={ROUTES}
            isSelected={(o) => ROUTES[route] === o}
            mode="single"
            onToggle={(o) => {
              setRoute(ROUTES.indexOf(o))
              setStatus(`M3 단일 선택: ${withEul(o)} 골랐습니다. 선택된 칸에 체크 표시가 붙습니다.`)
            }}
          />
        </section>

        <section aria-labelledby="sc-m3-multi">
          <h3 id="sc-m3-multi" className="mb-2 text-title-sm text-on-surface-variant">
            M3 Segmented button · 다중 선택
          </h3>
          <M3Segmented
            label="편의시설 필터"
            options={FILTERS}
            isSelected={(o) => filters.has(o)}
            mode="multi"
            onToggle={(o) => {
              const next = new Set(filters)
              if (next.has(o)) next.delete(o)
              else next.add(o)
              setFilters(next)
              setStatus(`M3 다중 선택: 지금 켜진 필터는 ${next.size ? [...next].join(', ') : '없음'}입니다.`)
            }}
          />
        </section>
      </div>
    </DemoScreen>
  )
}

/**
 * 단일 선택 컨트롤의 공통 키보드 동작: 화살표로 이동하면 곧바로 선택된다(라디오 그룹 패턴).
 * 그룹 전체가 Tab 정지점 하나만 갖도록 선택된 칸만 tabIndex=0으로 둔다.
 */
function useRadioKeys(count: number, value: number, onChange: (i: number) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKeyDown = (e: KeyboardEvent) => {
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (value + 1) % count
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (value - 1 + count) % count
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = count - 1
    if (next < 0) return
    e.preventDefault()
    onChange(next)
    refs.current[next]?.focus()
  }
  return { refs, onKeyDown }
}

function IosSegmented({ label, options, value, onChange }: { label: string; options: string[]; value: number; onChange: (i: number) => void }) {
  const { refs, onKeyDown } = useRadioKeys(options.length, value, onChange)
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className="relative flex rounded-[10px] bg-surface-container-highest p-0.5 dark:bg-surface-container-high">
      {/* 썸은 칸 하나 너비만큼 translateX로 움직인다. 선택을 칸마다 다시 그리지 않고 한 요소를 옮겨야 미끄러지는 느낌이 난다. */}
      <span
        aria-hidden="true"
        // 다크 테마에서는 iOS처럼 썸이 트랙보다 밝아야 선택된 칸으로 읽힌다.
        className="absolute inset-y-0.5 left-0.5 rounded-[8px] bg-surface-container-lowest shadow-elev-1 dark:bg-outline-variant transition-transform duration-300 ease-emphasized"
        style={{ width: `calc((100% - 4px) / ${options.length})`, transform: `translateX(${value * 100}%)` }}
      />
      {options.map((o, i) => (
        <button
          key={o}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="button"
          role="radio"
          aria-checked={i === value}
          tabIndex={i === value ? 0 : -1}
          onClick={() => onChange(i)}
          className={`relative min-h-11 flex-1 rounded-[8px] text-label-lg transition-colors ${i === value ? 'text-on-surface' : 'text-on-surface-variant'}`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

interface M3Props {
  label: string
  options: string[]
  mode: 'single' | 'multi'
  isSelected: (o: string) => boolean
  onToggle: (o: string) => void
}

/**
 * M3 Segmented button. 단일 선택은 radiogroup, 다중 선택은 aria-pressed 토글 버튼 묶음으로 표현한다.
 * 다중 선택은 칸마다 독립적인 켜기/끄기라서 화살표 이동 대신 일반 Tab 순서를 쓴다.
 */
function M3Segmented({ label, options, mode, isSelected, onToggle }: M3Props) {
  const value = options.findIndex(isSelected)
  const radio = useRadioKeys(options.length, value, (i) => onToggle(options[i]!))
  const single = mode === 'single'

  return (
    <div
      role={single ? 'radiogroup' : 'group'}
      aria-label={label}
      onKeyDown={single ? radio.onKeyDown : undefined}
      className="flex rounded-full border border-outline"
    >
      {options.map((o, i) => {
        const selected = isSelected(o)
        return (
          <button
            key={o}
            ref={(el) => {
              radio.refs.current[i] = el
            }}
            type="button"
            role={single ? 'radio' : undefined}
            aria-checked={single ? selected : undefined}
            aria-pressed={single ? undefined : selected}
            tabIndex={single ? (selected ? 0 : -1) : 0}
            onClick={() => onToggle(o)}
            className={`state-layer inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 px-2 text-label-lg first:rounded-l-full last:rounded-r-full [&:not(:first-child)]:border-l [&:not(:first-child)]:border-outline ${
              selected ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
            }`}
          >
            {selected && <Icon name="check" className="size-[18px] shrink-0" />}
            <span className="truncate">{o}</span>
          </button>
        )
      })}
    </div>
  )
}
