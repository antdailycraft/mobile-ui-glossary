import { useState } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { DemoScreen } from './_shared/DemoScreen'
import { tonalButton } from './_shared/ui'

type Dest = 'home' | 'mail' | 'alerts' | 'profile'

/** M3 large badge는 최대 4글자까지 쓴다. 그보다 큰 수는 "999+"로 줄인다. */
const formatCount = (n: number) => (n > 999 ? '999+' : String(n))

export default function BadgeDemo() {
  const [mail, setMail] = useState(3)
  const [alertDot, setAlertDot] = useState(true)
  const [dest, setDest] = useState<Dest>('home')
  const [status, setStatus] = useState('아래 버튼으로 배지 숫자를 바꾸거나, 내비게이션 항목을 눌러 보세요.')

  const change = (delta: number) => {
    const next = Math.max(0, mail + delta)
    setMail(next)
    setStatus(next === 0 ? '0개가 되어 배지가 사라졌습니다. 0은 표시하지 않습니다.' : `읽지 않은 메일이 ${next}개입니다.`)
  }

  const items: { id: Dest; icon: IconName; label: string; badge: 'none' | 'dot' | 'count'; a11y: string }[] = [
    { id: 'home', icon: 'home', label: '홈', badge: 'none', a11y: '홈' },
    {
      id: 'mail',
      icon: 'mail',
      label: '메일',
      badge: mail > 0 ? 'count' : 'none',
      a11y: mail > 0 ? `메일, 읽지 않은 메일 ${mail}개` : '메일',
    },
    {
      id: 'alerts',
      icon: 'notifications',
      label: '알림',
      badge: alertDot ? 'dot' : 'none',
      a11y: alertDot ? '알림, 새 알림 있음' : '알림',
    },
    { id: 'profile', icon: 'person', label: '프로필', badge: 'none', a11y: '프로필' },
  ]

  return (
    <div className="relative flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <DemoScreen title="배지" status={status}>
          <div className="flex flex-col gap-3 p-4">
            <p className="text-body-md text-on-surface-variant">
              메일에는 숫자가 있는 large badge, 알림에는 점만 있는 small badge가 붙어 있습니다.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={tonalButton} onClick={() => change(-1)}>
                −1
              </button>
              <button type="button" className={tonalButton} onClick={() => change(1)}>
                +1
              </button>
              <button type="button" className={tonalButton} onClick={() => change(500)}>
                +500
              </button>
            </div>
            <button
              type="button"
              className={tonalButton}
              onClick={() => {
                setAlertDot((d) => !d)
                setStatus(alertDot ? '알림 점 배지를 껐습니다.' : '새 알림이 와서 점 배지가 생겼습니다.')
              }}
            >
              알림 점 {alertDot ? '끄기' : '켜기'}
            </button>
          </div>
        </DemoScreen>
      </div>

      <nav aria-label="주 메뉴" className="flex h-20 shrink-0 bg-surface-container">
        {items.map((it) => {
          const active = dest === it.id
          return (
            <button
              key={it.id}
              type="button"
              // 배지 숫자는 그림처럼 보이기만 하므로, 의미는 버튼 이름에 문장으로 담는다.
              aria-label={it.a11y}
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                setDest(it.id)
                if (it.id === 'alerts' && alertDot) {
                  setAlertDot(false)
                  setStatus('알림 화면에 들어가서 확인했으므로 점 배지가 사라졌습니다.')
                } else setStatus(`“${it.label}”으로 이동했습니다.`)
              }}
              className="flex flex-1 flex-col items-center justify-center gap-1"
            >
              <span
                className={`state-layer relative flex h-8 w-16 items-center justify-center rounded-full ${
                  active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant'
                }`}
              >
                <Icon name={it.icon} />
                {it.badge === 'dot' && (
                  <span aria-hidden="true" className="absolute left-[calc(50%+6px)] top-1 size-1.5 rounded-full bg-error" />
                )}
                {it.badge === 'count' && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[calc(50%+4px)] top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[11px] font-medium leading-none text-on-error"
                  >
                    {formatCount(mail)}
                  </span>
                )}
              </span>
              <span className={`text-label-md ${active ? 'text-on-surface' : 'text-on-surface-variant'}`}>{it.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
