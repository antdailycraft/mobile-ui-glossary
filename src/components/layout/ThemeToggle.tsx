import type { IconName } from '../Icon'
import { IconButton } from '../IconButton'
import type { ThemeMode } from '../../lib/useTheme'

const ORDER: ThemeMode[] = ['system', 'light', 'dark']
const LABEL: Record<ThemeMode, string> = { system: '시스템 설정', light: '라이트', dark: '다크' }
const ICON: Record<ThemeMode, IconName> = { system: 'contrast', light: 'lightMode', dark: 'darkMode' }

/** 시스템 → 라이트 → 다크 순서로 순환한다. 현재 상태와 다음 상태를 모두 이름에 담아 동작을 예측할 수 있게 한다. */
export function ThemeToggle({ mode, onChange }: { mode: ThemeMode; onChange: (m: ThemeMode) => void }) {
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]!
  return (
    <IconButton
      icon={ICON[mode]}
      label={`테마: ${LABEL[mode]}. 누르면 ${LABEL[next]}(으)로 바뀝니다`}
      title={`테마: ${LABEL[mode]}`}
      onClick={() => onChange(next)}
    />
  )
}
