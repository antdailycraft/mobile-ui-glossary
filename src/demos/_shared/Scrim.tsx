interface Props {
  visible: boolean
  onClick?: () => void
  /** 쌓임 순서. 시트·다이얼로그보다 한 단계 아래에 둔다. */
  className?: string
}

/**
 * 모달 뒤의 화면을 어둡게 덮는 막. M3 기준 불투명도는 32%다.
 * 스크린 리더에는 의미가 없으므로 숨기고, 닫기 수단은 Esc나 닫기 버튼으로 따로 제공한다.
 */
export function Scrim({ visible, onClick, className = 'z-10' }: Props) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={`absolute inset-0 bg-scrim transition-opacity duration-300 ease-standard ${
        visible ? 'opacity-[0.32]' : 'pointer-events-none opacity-0'
      } ${className}`}
    />
  )
}
