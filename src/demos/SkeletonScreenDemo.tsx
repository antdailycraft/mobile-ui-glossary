import { useEffect, useState } from 'react'
import { IconButton } from '../components/IconButton'
import { DemoScreen } from './_shared/DemoScreen'

type Mode = 'skeleton' | 'spinner'

const POSTS = [
  { id: 1, author: '김지민', time: '5분 전', text: '제주 바다 사진을 올렸어요. 날씨가 정말 좋았습니다.', hue: 'from-primary-container to-tertiary-container' },
  { id: 2, author: '이서준', time: '1시간 전', text: '디자인 리뷰에서 나온 의견을 정리해 두었습니다.', hue: 'from-secondary-container to-primary-container' },
]

/** 가짜 네트워크 지연. 스켈레톤과 스피너의 체감 차이를 느낄 수 있을 만큼 길게 둔다. */
const LOAD_TIME = 2000

/*
 * shimmer 애니메이션은 이 데모에서만 쓰므로 전역 CSS 대신 컴포넌트 안에 둔다.
 * 배경 그라디언트를 두 배 너비로 깔고 위치를 옮겨 빛이 지나가는 효과를 낸다.
 * 동작 줄이기 설정에서는 애니메이션을 끄고 정적인 회색 블록만 보여 준다.
 */
const SHIMMER_CSS = `
.skeleton-block {
  background: linear-gradient(90deg,
    var(--md-surface-container-highest) 0%,
    var(--md-surface-container-low) 50%,
    var(--md-surface-container-highest) 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s linear infinite;
}
@keyframes skeleton-shimmer {
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton-block { animation: none; background: var(--md-surface-container-highest); }
}
`

export default function SkeletonScreenDemo() {
  const [mode, setMode] = useState<Mode>('skeleton')
  const [loading, setLoading] = useState(true)
  // 이 값이 바뀔 때마다 "불러오기"를 다시 시작한다.
  const [loadKey, setLoadKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => setLoading(false), LOAD_TIME)
    return () => window.clearTimeout(t)
  }, [loadKey, mode])

  const status = loading
    ? mode === 'skeleton'
      ? '불러오는 중입니다. 스켈레톤이 완성될 화면의 모양을 미리 보여 줍니다.'
      : '불러오는 중입니다. 스피너만으로는 무엇이 나올지 알 수 없습니다.'
    : '콘텐츠를 모두 불러왔습니다. 다시 불러오기로 반복해 보세요.'

  return (
    <DemoScreen
      title="피드"
      status={status}
      actions={<IconButton icon="refresh" label="다시 불러오기" onClick={() => setLoadKey((k) => k + 1)} />}
    >
      <style>{SHIMMER_CSS}</style>

      {/* 로딩 표시 방식 비교 토글 */}
      <div role="group" aria-label="로딩 표시 방식" className="mx-4 mb-3 flex rounded-full border border-outline">
        {(
          [
            ['skeleton', '스켈레톤'],
            ['spinner', '스피너'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
            className={`state-layer min-h-11 flex-1 rounded-full text-label-lg ${
              mode === value ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* aria-busy로 보조기기에 "아직 내용이 바뀌는 중"임을 알린다. 스켈레톤 블록 자체는 의미가 없으므로 숨긴다. */}
      <div aria-busy={loading} aria-live="polite" className="px-4 pb-4">
        {loading ? (
          mode === 'skeleton' ? (
            <div aria-hidden="true" className="flex flex-col gap-4">
              {POSTS.map((p) => (
                <SkeletonCard key={p.id} />
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <span className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="sr-only">불러오는 중</span>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-4 transition-opacity duration-300 starting:opacity-0">
            {POSTS.map((p) => (
              <article key={p.id} className="rounded-xl bg-surface-container-low p-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full bg-primary-container text-title-md text-on-primary-container"
                  >
                    {p.author[0]}
                  </span>
                  <div>
                    <p className="text-title-sm">{p.author}</p>
                    <p className="text-body-sm text-on-surface-variant">{p.time}</p>
                  </div>
                </div>
                <p className="mt-3 text-body-md">{p.text}</p>
                <div aria-hidden="true" className={`mt-3 aspect-[16/9] rounded-lg bg-gradient-to-br ${p.hue}`} />
              </article>
            ))}
          </div>
        )}
      </div>
    </DemoScreen>
  )
}

/** 실제 카드와 같은 크기·배치의 회색 블록. 콘텐츠가 들어와도 레이아웃이 밀리지 않게 하는 것이 핵심이다. */
function SkeletonCard() {
  return (
    <div className="rounded-xl bg-surface-container-low p-4">
      <div className="flex items-center gap-3">
        <span className="skeleton-block size-10 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <span className="skeleton-block h-3.5 w-20 rounded" />
          <span className="skeleton-block h-3 w-12 rounded" />
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <span className="skeleton-block h-3.5 w-full rounded" />
        <span className="skeleton-block h-3.5 w-2/3 rounded" />
      </div>
      <span className="skeleton-block mt-3 block aspect-[16/9] rounded-lg" />
    </div>
  )
}
