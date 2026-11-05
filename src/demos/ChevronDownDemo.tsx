import { useId, useState } from 'react'
import { Icon } from '../components/Icon'
import { DemoScreen } from './_shared/DemoScreen'

const FAQ = [
  { q: '배송은 얼마나 걸리나요?', a: '주문 후 평균 2~3일이 걸립니다. 도서·산간 지역은 하루 이틀 더 걸릴 수 있습니다.' },
  { q: '주문을 취소할 수 있나요?', a: '배송이 시작되기 전까지는 주문 내역에서 바로 취소할 수 있습니다.' },
]

const DESCRIPTION =
  '이 제품은 재활용 소재로 만든 가벼운 백팩입니다. 노트북 칸에는 16인치 노트북까지 들어가고, 옆 주머니에는 물병을 넣을 수 있습니다. 비가 와도 안쪽이 젖지 않도록 방수 코팅을 했고, 등판에는 통풍 패드를 넣어 오래 메어도 덥지 않습니다.'

export default function ChevronDownDemo() {
  const [status, setStatus] = useState('⌄가 붙은 제목을 눌러 펼쳐 보고, › 행과 비교해 보세요.')
  const [moreOpen, setMoreOpen] = useState(false)
  const descId = useId()

  return (
    <DemoScreen title="고객센터" status={status}>
      <section aria-labelledby="cd-faq" className="px-4 pb-2">
        <h2 id="cd-faq" className="py-2 text-title-sm text-on-surface-variant">
          자주 묻는 질문 · 아코디언
        </h2>
        <ul className="overflow-hidden rounded-xl bg-surface-container">
          {FAQ.map((item, i) => (
            <AccordionItem
              key={item.q}
              question={item.q}
              answer={item.a}
              divider={i > 0}
              onToggle={(open) => setStatus(open ? '⌄가 ⌃로 돌아가며 답변이 펼쳐졌습니다.' : '⌃가 다시 ⌄로 돌아가며 접혔습니다.')}
            />
          ))}
        </ul>
      </section>

      <section aria-labelledby="cd-more" className="px-4 pb-2">
        <h2 id="cd-more" className="py-2 text-title-sm text-on-surface-variant">
          상품 설명 · 더 보기
        </h2>
        <p id={descId} className={`text-body-md ${moreOpen ? '' : 'line-clamp-2'}`}>
          {DESCRIPTION}
        </p>
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls={descId}
          onClick={() => {
            setMoreOpen(!moreOpen)
            setStatus(moreOpen ? '설명을 다시 두 줄로 접었습니다.' : '같은 자리에서 나머지 설명이 펼쳐졌습니다.')
          }}
          className="state-layer -ml-3 mt-1 inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-label-lg text-primary"
        >
          {moreOpen ? '접기' : '더 보기'}
          <Icon
            name="expandMore"
            className={`size-5 transition-transform duration-200 ease-standard ${moreOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </section>

      <section aria-labelledby="cd-nav" className="px-4 pb-4">
        <h2 id="cd-nav" className="py-2 text-title-sm text-on-surface-variant">
          비교 · 다른 화면으로 이동
        </h2>
        <button
          type="button"
          onClick={() => setStatus('› 는 펼치지 않고 다른 화면으로 이동한다는 뜻입니다. (데모에서는 이동하지 않습니다.)')}
          className="state-layer flex min-h-14 w-full items-center gap-3 rounded-xl bg-surface-container px-4 text-left text-body-lg"
        >
          <span className="flex-1">1:1 문의하기</span>
          <Icon name="chevronRight" className="size-6 text-on-surface-variant" />
        </button>
      </section>
    </DemoScreen>
  )
}

interface AccordionItemProps {
  question: string
  answer: string
  divider: boolean
  onToggle: (open: boolean) => void
}

/** WAI-ARIA Accordion 패턴. 제목 버튼이 aria-expanded로 열림 상태를, aria-controls로 펼쳐지는 영역을 알린다. */
function AccordionItem({ question, answer, divider, onToggle }: AccordionItemProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  return (
    <li className={divider ? 'border-t border-outline-variant' : ''}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            setOpen(!open)
            onToggle(!open)
          }}
          className="state-layer flex min-h-14 w-full items-center gap-3 px-4 text-left text-body-lg"
        >
          <span className="flex-1">{question}</span>
          {/* 아이콘을 바꾸지 않고 돌리면 방향이 바뀌는 과정이 보여 "같은 버튼이 반대로 동작한다"는 것이 더 잘 전달된다. */}
          <Icon
            name="expandMore"
            className={`size-6 shrink-0 text-on-surface-variant transition-transform duration-200 ease-standard ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </h3>
      <div id={panelId} hidden={!open} className="px-4 pb-4 text-body-md text-on-surface-variant">
        {answer}
      </div>
    </li>
  )
}
