import { useId, useRef, useState, type KeyboardEvent, type UIEvent } from 'react'
import { IconButton } from '../components/IconButton'

type Variant = 'small' | 'center' | 'medium' | 'large'

const VARIANTS: { id: Variant; label: string }[] = [
  { id: 'small', label: 'Small' },
  { id: 'center', label: 'Center' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
]

const TITLE = '여행 사진'

/** 접히는 제목 영역의 높이(rem). M3 Medium은 112dp, Large는 152dp 앱 바에서 64dp 막대를 뺀 값이다. */
const EXPANDED_HEIGHT: Record<Variant, number> = { small: 0, center: 0, medium: 3, large: 5.5 }

const ITEMS = Array.from({ length: 14 }, (_, i) => `${i + 1}번째 앨범 · 사진 ${(i * 7) % 40 + 3}장`)

export default function TopAppBarDemo() {
  const [variant, setVariant] = useState<Variant>('small')
  const [scrollRem, setScrollRem] = useState(0)
  const [status, setStatus] = useState('목록을 스크롤하거나 아래에서 앱 바 유형을 바꿔 보세요.')
  const [panel, setPanel] = useState<'search' | 'more' | 'account' | null>(null)
  const [query, setQuery] = useState('')
  const [reversed, setReversed] = useState(false)
  const [albumsOpen, setAlbumsOpen] = useState(true)
  const panelId = useId()
  const filtered = ITEMS.filter((item) => item.includes(query.trim()))
  const items = reversed ? filtered.reverse() : filtered
  const scrollRef = useRef<HTMLDivElement>(null)

  const expanded = EXPANDED_HEIGHT[variant]
  // 큰 제목이 거의 다 가려졌을 때 막대 안의 작은 제목을 보여 준다. 두 제목이 동시에 보이면 중복으로 읽히기 때문이다.
  const collapsed = expanded === 0 || scrollRem >= expanded - 0.5
  // 콘텐츠가 앱 바 밑으로 지나가기 시작하면 색을 바꿔 경계를 표시한다(M3의 "on scroll" 상태).
  const scrolled = scrollRem > expanded

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const top = e.currentTarget.scrollTop / rootSize
    setScrollRem(top)
    if (expanded > 0 && top >= expanded - 0.5 && scrollRem < expanded - 0.5) {
      setStatus('큰 제목이 스크롤되어 사라지면서 막대 안의 작은 제목으로 접혔습니다.')
    } else if (top > 0 && scrollRem === 0) {
      setStatus('콘텐츠가 앱 바 밑으로 들어가면서 앱 바 색이 바뀌었습니다.')
    }
  }

  const choose = (v: Variant) => {
    setPanel(null)
    setAlbumsOpen(true)
    setQuery('')
    setVariant(v)
    setScrollRem(0)
    scrollRef.current?.scrollTo({ top: 0 })
    const desc: Record<Variant, string> = {
      small: 'Small: 제목이 왼쪽에 있는 기본형입니다.',
      center: 'Center-aligned: 제목이 가운데에 있습니다. 화면에 동작이 하나뿐일 때 어울립니다.',
      medium: 'Medium: 제목이 막대 아래에 크게 나왔다가 스크롤하면 접힙니다.',
      large: 'Large: 가장 큰 제목입니다. 앱의 최상위 화면에 씁니다.',
    }
    setStatus(desc[v])
  }

  const title = (
    <p
      className={`min-w-0 flex-1 truncate px-1 text-title-lg transition-opacity duration-200 ${
        variant === 'center' ? 'text-center' : ''
      } ${collapsed ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!collapsed}
    >
      {TITLE}
    </p>
  )

  return (
    <div className="flex h-full flex-col bg-surface text-on-surface">
      <header
        className={`relative z-10 flex h-[4.5rem] shrink-0 items-center gap-1 px-4 transition-colors duration-200 ${
          scrolled ? 'bg-surface-container' : 'bg-surface'
        }`}
      >
        {albumsOpen && <IconButton icon="arrowBack" label="뒤로 가기" onClick={() => { setPanel(null); setQuery(''); setAlbumsOpen(false); setStatus('상위 화면으로 돌아왔습니다.') }} />}
        {albumsOpen ? title : <p className="flex-1 px-1 text-title-lg">앨범</p>}
        {albumsOpen && (variant === 'center' ? (
          <IconButton icon="person" label="내 계정" aria-expanded={panel === 'account'} onClick={() => setPanel(panel === 'account' ? null : 'account')} />
        ) : (
          <>
            <IconButton icon="search" label="검색" aria-expanded={panel === 'search'} onClick={() => { setQuery(''); setPanel(panel === 'search' ? null : 'search') }} />
            <IconButton icon="moreVert" label="더보기" aria-expanded={panel === 'more'} onClick={() => { setQuery(''); setPanel(panel === 'more' ? null : 'more') }} />
          </>
        ))}
      </header>

      {panel === 'search' && (
        <div className="shrink-0 px-4 py-2">
          <label htmlFor={panelId} className="text-body-sm">앨범 검색</label>
          <input id={panelId} type="search" autoFocus value={query} onChange={(event) => {
            setQuery(event.target.value)
            if (scrollRef.current) scrollRef.current.scrollTop = 0
          }} className="mt-1 min-h-11 w-full rounded-lg border border-outline px-3" />
        </div>
      )}
      {panel === 'more' && (
        <div className="shrink-0 px-4 py-2">
          <button type="button" className="state-layer min-h-11 rounded-lg bg-secondary-container px-3 text-on-secondary-container" onClick={() => {
            setReversed(!reversed)
            setStatus(reversed ? '앨범 번호 오름차순으로 정렬했습니다.' : '앨범 번호 내림차순으로 정렬했습니다.')
          }}>{reversed ? '앨범 번호 오름차순' : '앨범 번호 내림차순'}</button>
        </div>
      )}
      {panel === 'account' && <p className="shrink-0 bg-surface-container px-4 py-3">내 계정 · 데모 사용자</p>}

      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        {albumsOpen && expanded > 0 && (
          // 펼친 제목은 스크롤 콘텐츠의 첫 줄로 둔다. 별도 계산 없이도 스크롤한 만큼 자연스럽게 밀려 올라간다.
          <h2
            style={{ height: `${expanded}rem` }}
            className={`flex items-end px-4 pb-3 ${variant === 'large' ? 'text-display-sm' : 'text-headline-sm'}`}
          >
            {TITLE}
          </h2>
        )}
        {!albumsOpen ? (
          <button type="button" className="state-layer m-4 min-h-11 rounded-lg bg-secondary-container px-4 text-on-secondary-container" onClick={() => {
            setAlbumsOpen(true)
            setStatus('여행 사진 앨범을 열었습니다.')
          }}>여행 사진 열기</button>
        ) : items.length === 0 ? (
          <p className="p-4 text-body-md">검색 결과가 없습니다.</p>
        ) : <ul className="pb-4">
          {items.map((item) => (
            <li key={item} className="flex min-h-14 items-center gap-4 px-4">
              <span aria-hidden="true" className="size-10 shrink-0 rounded-lg bg-secondary-container" />
              <span className="text-body-lg">{item}</span>
            </li>
          ))}
        </ul>}
      </div>

      <div className="shrink-0 border-t border-outline-variant bg-surface-container-low px-4 pb-4 pt-2">
        <p role="status" className="mb-2 min-h-8 text-body-sm text-on-surface-variant">
          {status}
        </p>
        <VariantPicker value={variant} onChange={choose} />
      </div>
    </div>
  )
}

/** 앱 바 유형을 고르는 라디오 그룹. 화살표 키로 이동하면서 바로 선택된다. */
function VariantPicker({ value, onChange }: { value: Variant; onChange: (v: Variant) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = VARIANTS.findIndex((v) => v.id === value)

  const onKeyDown = (e: KeyboardEvent) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (index + delta + VARIANTS.length) % VARIANTS.length
    onChange(VARIANTS[next]!.id)
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-label="앱 바 유형" onKeyDown={onKeyDown} className="flex rounded-full border border-outline">
      {VARIANTS.map((v, i) => {
        const selected = v.id === value
        return (
          <button
            key={v.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(v.id)}
            className={`state-layer min-h-11 flex-1 border-outline text-label-lg first:rounded-l-full last:rounded-r-full [&:not(:first-child)]:border-l ${
              selected ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
            }`}
          >
            {v.label}
          </button>
        )
      })}
    </div>
  )
}
