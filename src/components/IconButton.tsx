import type { ButtonHTMLAttributes, Ref } from 'react'
import { Icon, type IconName } from './Icon'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  /** 아이콘만 있는 버튼이므로 접근 가능한 이름이 반드시 필요하다. */
  label: string
  ref?: Ref<HTMLButtonElement>
}

/** M3 standard icon button. 터치 영역은 48×48px로 최소 기준(44px)보다 넉넉하게 잡는다. */
export function IconButton({ icon, label, className = '', type = 'button', ref, ...rest }: Props) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={`state-layer inline-flex size-12 shrink-0 items-center justify-center rounded-full text-on-surface-variant ${className}`}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  )
}
