import { Suspense, useState } from 'react'
import { Icon } from '../Icon'
import { PhoneFrame } from './PhoneFrame'
import { getDemo } from '../../lib/demos'

/**
 * 데모를 불러와 휴대폰 화면 안에 그린다.
 * "초기화"는 key를 바꿔 데모 컴포넌트를 통째로 다시 마운트하는 방식이다.
 * 그래서 개별 데모는 초기화 로직을 따로 구현하지 않아도 된다.
 */
export function DemoHost({ demo, title }: { demo: string; title: string }) {
  const [resetKey, setResetKey] = useState(0)
  const Demo = getDemo(demo)

  return (
    <section aria-labelledby="demo-heading" className="mt-10 scroll-mt-20" id="demo-section">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 id="demo-heading" tabIndex={-1} className="text-title-lg outline-none">
          실동작 데모
        </h2>
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          className="state-layer inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-label-lg text-primary"
        >
          <Icon name="restart" className="size-[18px]" />
          초기화
        </button>
      </div>
      <p className="mb-4 text-body-md text-on-surface-variant">화면 안에서 직접 눌러 보고 끌어 보세요.</p>
      <PhoneFrame label={`${title} 데모 화면`}>
        {Demo ? (
          <Suspense fallback={<p className="p-6 text-body-md text-on-surface-variant">데모를 불러오는 중…</p>}>
            <Demo key={resetKey} />
          </Suspense>
        ) : (
          <p className="p-6 text-body-md text-error">데모 “{demo}”를 찾을 수 없습니다.</p>
        )}
      </PhoneFrame>
    </section>
  )
}
