import { useRef, useState, type ReactNode } from 'react'
import { Icon, type IconName } from '../components/Icon'

/** 받침 유무에 따라 조사를 고른다. 상태 문구에 들어가는 라벨이 바뀌어도 "알림으로", "도보를"처럼 자연스럽게 읽히게 하기 위해서다. */
const finalOf = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code <= 11171 ? code % 28 : 0
}
const withRo = (w: string) => `“${w}”${finalOf(w) && finalOf(w) !== 8 ? '으로' : '로'}`
const withEul = (w: string) => `“${w}”${finalOf(w) ? '을' : '를'}`


interface Destination {
  id: string
  label: string
  icon: IconName
  /** 선택된 목적지는 채워진 아이콘을 쓰는 것이 M3 규칙이다. 채워진 버전이 따로 있는 아이콘만 지정한다. */
  activeIcon?: IconName
  badge?: number
}

const DESTINATIONS: Destination[] = [
  { id: 'home', label: '홈', icon: 'home' },
  { id: 'search', label: '검색', icon: 'search' },
  { id: 'saved', label: '저장됨', icon: 'favoriteBorder', activeIcon: 'favorite' },
  { id: 'alerts', label: '알림', icon: 'notifications', badge: 3 },
  { id: 'profile', label: '프로필', icon: 'person' },
]

const CONTENT: Record<string, { title: string; rows: string[] }> = {
  home: { title: '홈', rows: ['오늘의 추천 장소', '최근 본 여행지', '이번 주 인기 코스', '친구가 저장한 곳', '가까운 맛집', '주말 날씨'] },
  search: { title: '검색', rows: ['최근 검색: 제주', '최근 검색: 부산 카페', '인기 검색어: 단풍', '인기 검색어: 캠핑'] },
  saved: { title: '저장됨', rows: ['성산일출봉', '감천문화마을', '전주 한옥마을'] },
  alerts: { title: '알림', rows: ['지민 님이 회원님의 사진을 좋아합니다', '저장한 장소에 새 후기가 있습니다', '여행 일정이 내일 시작됩니다'] },
  profile: { title: '프로필', rows: ['내 여행 기록', '설정', '도움말'] },
}

export default function BottomNavigationDemo() {
  const [current, setCurrent] = useState('home')
  const [alwaysLabels, setAlwaysLabels] = useState(true)
  const [badges, setBadges] = useState<Record<string, number | undefined>>({ alerts: 3 })
  const [status, setStatus] = useState('아래 막대의 목적지를 눌러 화면을 바꿔 보세요.')
  const scrollRef = useRef<HTMLDivElement>(null)

  const select = (d: Destination) => {
    if (d.id === current) {
      // 이미 선택된 목적지를 다시 누르면 맨 위로 올라가는 것이 두 플랫폼 모두의 관례다.
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      setStatus(`이미 선택된 ${withEul(d.label)} 다시 눌러 목록 맨 위로 이동했습니다.`)
      return
    }
    setCurrent(d.id)
    scrollRef.current?.scrollTo({ top: 0 })
    if (badges[d.id]) {
      setBadges((b) => ({ ...b, [d.id]: undefined }))
      setStatus(`${withRo(d.label)} 이동했습니다. 확인했으므로 배지가 사라졌습니다.`)
    } else {
      setStatus(`${withRo(d.label)} 이동했습니다. 막대는 그대로 남아 어디서든 다시 이동할 수 있습니다.`)
    }
  }

  const page = CONTENT[current]!

  return (
    <div className="flex h-full flex-col bg-surface text-on-surface">
      <header className="flex h-16 shrink-0 items-center px-4">
        <p className="text-title-lg">{page.title}</p>
      </header>
      <p role="status" className="mx-4 mb-2 shrink-0 rounded-lg bg-surface-container-high px-3 py-2 text-body-sm text-on-surface-variant">
        {status}
      </p>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <label className="flex min-h-12 items-center justify-between gap-3 px-4 text-body-md text-on-surface-variant">
          라벨 항상 표시
          <input
            type="checkbox"
            checked={alwaysLabels}
            onChange={(e) => {
              setAlwaysLabels(e.target.checked)
              setStatus(e.target.checked ? '모든 목적지에 라벨을 보여 줍니다(권장).' : '선택된 목적지에만 라벨을 보여 줍니다. 아이콘만으로는 뜻이 모호할 수 있습니다.')
            }}
            className="size-5 accent-[var(--md-primary)]"
          />
        </label>
        <ul>
          {page.rows.map((row) => (
            <li key={row} className="flex min-h-14 items-center gap-4 px-4">
              <span aria-hidden="true" className="size-10 shrink-0 rounded-full bg-tertiary-container" />
              <span className="text-body-lg">{row}</span>
            </li>
          ))}
        </ul>
      </div>

      <nav aria-label="주 메뉴" className="flex h-20 shrink-0 bg-surface-container">
        {DESTINATIONS.map((d) => {
          const active = d.id === current
          const badge = badges[d.id]
          return (
            <button
              key={d.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              aria-label={badge ? `${d.label}, 새 알림 ${badge}개` : d.label}
              onClick={() => select(d)}
              className="group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 pb-1 pt-3"
            >
              <Indicator active={active}>
                <Icon name={active && d.activeIcon ? d.activeIcon : d.icon} className="size-6" />
                {badge !== undefined && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[calc(50%+4px)] top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[11px] font-medium leading-none text-on-error"
                  >
                    {badge}
                  </span>
                )}
              </Indicator>
              <span
                aria-hidden="true"
                className={`text-label-md transition-opacity duration-200 ${active ? 'font-bold text-on-surface' : 'text-on-surface-variant'} ${
                  alwaysLabels || active ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {d.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

/** 아이콘 뒤의 알약 모양 활성 표시(64×32). 선택될 때 가로로 늘어나며 나타난다. */
function Indicator({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span className="relative flex h-8 w-16 items-center justify-center">
      <span
        aria-hidden="true"
        className={`absolute inset-0 rounded-full bg-secondary-container transition-[scale,opacity] duration-200 ease-emphasized ${
          active ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-0'
        }`}
      />
      {/* 비활성 상태의 hover/pressed 피드백도 같은 알약 영역에 보여 준다. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-on-surface opacity-0 transition-opacity group-hover:opacity-[0.08] group-active:opacity-[0.1]"
      />
      <span className={`relative flex ${active ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>{children}</span>
    </span>
  )
}
