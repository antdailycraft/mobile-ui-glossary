import { useState } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { DemoScreen } from './_shared/DemoScreen'
import { filledButton, textButton } from './_shared/ui'

type Scenario = 'first' | 'search' | 'error'

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: 'first', label: '처음 사용' },
  { value: 'search', label: '검색 결과 없음' },
  { value: 'error', label: '오류' },
]

const MEMOS = ['회의록: 디자인 리뷰', '장보기 목록', '여행 준비물']

interface EmptyProps {
  icon: IconName
  title: string
  description: string
  /** 빈 상태에서 벗어날 수 있는 가장 중요한 행동 하나 */
  action: { label: string; onClick: () => void }
  secondary?: { label: string; onClick: () => void }
  tone?: 'neutral' | 'error'
}

/** 빈 상태의 공통 구조: 그림(아이콘) → 무슨 상황인지 → 왜 그런지/무엇을 할 수 있는지 → 행동 버튼 */
function EmptyState({ icon, title, description, action, secondary, tone = 'neutral' }: EmptyProps) {
  return (
    // 한국어는 어절 단위로 줄을 바꿔야 단어가 중간에서 끊기지 않는다(break-keep).
    <div className="flex flex-col items-center px-8 py-10 text-center break-keep">
      <span
        aria-hidden="true"
        className={`flex size-24 items-center justify-center rounded-full ${
          tone === 'error' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'
        }`}
      >
        <Icon name={icon} className="size-12" />
      </span>
      <h2 className="mt-6 text-title-lg">{title}</h2>
      <p className="mt-2 text-body-md text-on-surface-variant">{description}</p>
      <button type="button" className={`${filledButton} mt-6`} onClick={action.onClick}>
        {action.label}
      </button>
      {secondary && (
        <button type="button" className={`${textButton} mt-2`} onClick={secondary.onClick}>
          {secondary.label}
        </button>
      )}
    </div>
  )
}

export default function EmptyStateDemo() {
  const [scenario, setScenario] = useState<Scenario>('first')
  // 각 시나리오에서 행동 버튼을 누르면 빈 상태를 벗어나 실제 목록을 보여 준다.
  const [resolved, setResolved] = useState(false)
  const [memos, setMemos] = useState<string[]>([])
  const [query, setQuery] = useState('ㅋㅋㅋ')
  const [retrying, setRetrying] = useState(false)
  const [status, setStatus] = useState('위 버튼으로 빈 상태의 종류를 바꿔 보세요.')

  const choose = (s: Scenario) => {
    setScenario(s)
    setResolved(false)
    setMemos([])
    setQuery(s === 'search' ? 'ㅋㅋㅋ' : '')
    setRetrying(false)
    setStatus(`“${SCENARIOS.find((x) => x.value === s)!.label}” 빈 상태입니다.`)
  }

  const results = scenario === 'search' ? MEMOS.filter((m) => m.includes(query.trim())) : MEMOS

  const renderBody = () => {
    if (scenario === 'first') {
      if (memos.length > 0)
        return <MemoList items={memos} />
      return (
        <EmptyState
          icon="edit"
          title="아직 메모가 없습니다"
          description="떠오르는 생각을 적어 두세요. 작성한 메모는 이곳에 모입니다."
          action={{
            label: '첫 메모 만들기',
            onClick: () => {
              setMemos(['새 메모'])
              setStatus('첫 메모를 만들어 빈 상태에서 벗어났습니다.')
            },
          }}
        />
      )
    }
    if (scenario === 'search') {
      if (results.length > 0) return <MemoList items={results} />
      return (
        <EmptyState
          icon="search"
          title={`‘${query}’에 대한 결과가 없습니다`}
          description="철자를 확인하거나 더 짧은 검색어로 다시 찾아보세요."
          action={{
            label: '검색어 지우기',
            onClick: () => {
              setQuery('')
              setStatus('검색어를 지워 전체 메모가 다시 보입니다.')
            },
          }}
        />
      )
    }
    if (resolved) return <MemoList items={MEMOS} />
    return (
      <EmptyState
        tone="error"
        icon="warning"
        title="메모를 불러오지 못했습니다"
        description={retrying ? '다시 연결하는 중입니다…' : '인터넷 연결을 확인한 뒤 다시 시도해 주세요.'}
        action={{
          label: retrying ? '다시 시도하는 중…' : '다시 시도',
          onClick: () => {
            if (retrying) return
            setRetrying(true)
            setStatus('다시 시도하는 중입니다.')
            window.setTimeout(() => {
              setRetrying(false)
              setResolved(true)
              setStatus('다시 시도에 성공해 메모를 불러왔습니다.')
            }, 900)
          },
        }}
        secondary={{ label: '오프라인 메모 보기', onClick: () => setStatus('오프라인 메모 보기를 선택했습니다. (데모에서는 동작을 생략합니다)') }}
      />
    )
  }

  return (
    <DemoScreen
      title="메모"
      status={status}
      actions={<IconButton icon="search" label="검색" onClick={() => choose('search')} />}
    >
      <div role="group" aria-label="빈 상태 종류" className="flex gap-2 overflow-x-auto px-4 pb-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.value}
            type="button"
            aria-pressed={scenario === s.value}
            onClick={() => choose(s.value)}
            className={`state-layer inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg border px-3 text-label-lg ${
              scenario === s.value
                ? 'border-transparent bg-secondary-container text-on-secondary-container'
                : 'border-outline text-on-surface-variant'
            }`}
          >
            {scenario === s.value && <Icon name="check" className="size-[18px]" />}
            {s.label}
          </button>
        ))}
      </div>
      {scenario === 'search' && (
        <div className="mx-4 mt-1 flex h-12 items-center gap-2 rounded-full bg-surface-container-high px-4">
          <Icon name="search" className="size-5 text-on-surface-variant" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="메모 검색"
            className="h-full min-w-0 flex-1 bg-transparent text-body-lg outline-none"
          />
        </div>
      )}
      {renderBody()}
    </DemoScreen>
  )
}

function MemoList({ items }: { items: string[] }) {
  return (
    <ul className="px-2 py-2">
      {items.map((m) => (
        <li key={m} className="flex min-h-14 items-center gap-4 rounded-xl px-4 text-body-lg">
          <Icon name="edit" className="size-5 text-on-surface-variant" />
          {m}
        </li>
      ))}
    </ul>
  )
}
